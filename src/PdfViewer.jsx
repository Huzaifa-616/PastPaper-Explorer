import React from 'react';

const PdfViewer = ({ pdfUrl }) => {
  // We point the iframe to the viewer.html inside your public folder
  // ?file= tells the viewer which PDF to load
  const viewerPath = `/pdf-viewer/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <iframe
        src={viewerPath}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="PDF Viewer"
      />
    </div>
  );
};

export default PdfViewer;