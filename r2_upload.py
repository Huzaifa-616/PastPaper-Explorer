"""
The Nexus - Cloudflare R2 Uploader
===================================
Syncs local files (question slices, PDFs) to your R2 bucket over the
S3-compatible API. Credentials are read from .env (never hard-coded, never
committed - .env is gitignored).

Two ways to use it:

  # Standalone: push a whole local folder to a key prefix in the bucket
  python r2_upload.py ./public/topicals topicals
  python r2_upload.py ./public/papers   papers

  # Or imported by generate_topicals_v2.py via the --upload-r2 flag,
  # which uploads slices automatically right after slicing.

Behaviour:
  - Skips files already in the bucket with the same size (incremental sync),
    so re-runs only upload what's new/changed - cheap and fast.
  - Sets correct Content-Type so browsers render .webp/.pdf inline.
  - Prints a clear summary; never deletes anything remotely.

Required .env keys:
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
Requires: boto3, python-dotenv
"""

import os
import sys
import mimetypes

try:
    import boto3
    from botocore.config import Config
    from botocore.exceptions import ClientError, EndpointConnectionError, NoCredentialsError
except ImportError:
    print("Missing dependency. Run:  pip install boto3 python-dotenv")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv optional if vars are already in the environment

CONTENT_TYPES = {".webp": "image/webp", ".pdf": "application/pdf",
                 ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json"}


def _client():
    account_id = os.environ.get("R2_ACCOUNT_ID")
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    missing = [k for k, v in {
        "R2_ACCOUNT_ID": account_id, "R2_ACCESS_KEY_ID": access_key,
        "R2_SECRET_ACCESS_KEY": secret_key}.items() if not v]
    if missing:
        print(f"Missing .env values: {', '.join(missing)}")
        sys.exit(1)

    endpoint = f"https://{account_id}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(
            signature_version="s3v4",
            retries={"max_attempts": 2, "mode": "standard"},
            connect_timeout=15,   # fail fast on a stalled handshake
            read_timeout=60,      # generous for actual file transfer
            max_pool_connections=10,
        ),
        region_name="auto",
    )


def _remote_sizes(client, bucket, prefix):
    """Map of key -> size for everything already under prefix (one listing)."""
    sizes = {}
    token = None
    while True:
        kw = {"Bucket": bucket, "Prefix": prefix}
        if token:
            kw["ContinuationToken"] = token
        resp = client.list_objects_v2(**kw)
        for obj in resp.get("Contents", []):
            sizes[obj["Key"]] = obj["Size"]
        if resp.get("IsTruncated"):
            token = resp.get("NextContinuationToken")
        else:
            break
    return sizes


def upload_folder(local_dir, key_prefix, bucket=None, verbose=True):
    """Sync local_dir into bucket under key_prefix. Returns (uploaded, skipped)."""
    bucket = bucket or os.environ.get("R2_BUCKET")
    if not bucket:
        print("No bucket: set R2_BUCKET in .env or pass bucket=")
        sys.exit(1)
    if not os.path.isdir(local_dir):
        print(f"Local folder not found: {local_dir}")
        sys.exit(1)

    client = _client()
    key_prefix = key_prefix.strip("/")

    # Preflight: a quick, bounded check that we can actually talk to the bucket.
    # This turns a mysterious hang into a fast, readable failure.
    if verbose:
        print(f"Connecting to R2 bucket '{bucket}' ...", flush=True)
    try:
        client.head_bucket(Bucket=bucket)
        if verbose:
            print("  connected.", flush=True)
    except Exception as e:
        from botocore.exceptions import ClientError as _CE, EndpointConnectionError as _ECE, ConnectTimeoutError as _CTE
        if isinstance(e, _CTE):
            print("Connection timed out reaching R2 (15s). The endpoint responds to curl,\n"
                  "so this is usually a proxy/VPN or Python-SSL issue on this machine.\n"
                  "Try: (1) disable any VPN/proxy, (2) run from another network, or\n"
                  "(3) use the wrangler upload method instead (ask for instructions).")
            sys.exit(1)
        if isinstance(e, _ECE):
            print("Cannot reach R2 endpoint — check R2_ACCOUNT_ID in .env.")
            sys.exit(1)
        code = getattr(e, "response", {}).get("Error", {}).get("Code", "") if isinstance(e, _CE) else ""
        if code in ("403", "AccessDenied", "InvalidAccessKeyId", "SignatureDoesNotMatch"):
            print("Auth failed — the token likely lacks access to this bucket, or the\n"
                  "Access Key / Secret in .env is wrong. Regenerate an Object Read & Write\n"
                  "token scoped to 'nexus-storage' and update .env.")
            sys.exit(1)
        if code in ("404", "NoSuchBucket"):
            print(f"Bucket '{bucket}' not found — check R2_BUCKET in .env (exact spelling).")
            sys.exit(1)
        print(f"R2 preflight failed: {type(e).__name__}: {e}")
        sys.exit(1)

    # verify credentials & bucket up front with a clear error
    try:
        existing = _remote_sizes(client, bucket, key_prefix + "/")
    except (NoCredentialsError, ClientError) as e:
        code = getattr(e, "response", {}).get("Error", {}).get("Code", "")
        if code in ("InvalidAccessKeyId", "SignatureDoesNotMatch", "403", "AccessDenied"):
            print("Auth failed — check R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in .env,"
                  " and that the token has Object Read & Write on this bucket.")
        elif code == "NoSuchBucket":
            print(f"Bucket '{bucket}' not found — check R2_BUCKET in .env.")
        else:
            print(f"R2 error: {e}")
        sys.exit(1)
    except EndpointConnectionError:
        print("Cannot reach R2 — check R2_ACCOUNT_ID and your network.")
        sys.exit(1)

    uploaded = skipped = 0
    for root, _dirs, files in os.walk(local_dir):
        for name in files:
            local_path = os.path.join(root, name)
            rel = os.path.relpath(local_path, local_dir).replace(os.sep, "/")
            key = f"{key_prefix}/{rel}"
            size = os.path.getsize(local_path)

            if existing.get(key) == size:      # already there, same size
                skipped += 1
                continue

            ext = os.path.splitext(name)[1].lower()
            ctype = CONTENT_TYPES.get(ext) or mimetypes.guess_type(name)[0] or "application/octet-stream"
            try:
                client.upload_file(local_path, bucket, key, ExtraArgs={"ContentType": ctype})
                uploaded += 1
                if verbose and uploaded % 50 == 0:
                    print(f"  ...{uploaded} uploaded")
            except ClientError as e:
                print(f"  FAILED {key}: {e}")

    if verbose:
        print(f"R2 sync '{local_dir}' -> {bucket}/{key_prefix}/ : "
              f"{uploaded} uploaded, {skipped} unchanged.")
    return uploaded, skipped


def main():
    if len(sys.argv) < 3:
        print("Usage: python r2_upload.py <local_folder> <key_prefix>")
        print("  e.g. python r2_upload.py ./public/topicals topicals")
        print("       python r2_upload.py ./public/papers papers")
        sys.exit(1)
    upload_folder(sys.argv[1], sys.argv[2])


if __name__ == "__main__":
    main()