import JSZip from 'jszip';

interface FileToDownload {
  url: string;
  filename: string;
}

interface DownloadMessage {
  action: 'downloadFiles';
  files: FileToDownload[];
}

// Helper function to convert a blob to a data URI
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function createZipAndDownload(files: FileToDownload[]) {
  const zip = new JSZip();

  const filePromises = files.map(async (file) => {
    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        console.error(`Failed to fetch ${file.url}: ${response.statusText}`);
        return;
      }
      const blob = await response.blob();
      zip.file(file.filename, blob);
    } catch (error) {
      console.error(`Error fetching or adding file ${file.filename}:`, error);
    }
  });

  await Promise.all(filePromises);

  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = await blobToDataURL(zipBlob);

    chrome.downloads.download({
      url: downloadUrl,
      filename: 'attachments.zip',
      saveAs: true,
    });
  } catch (error) {
    console.error('Error generating or downloading zip file:', error);
  }
}

chrome.runtime.onMessage.addListener((message: DownloadMessage, _sender, sendResponse) => {
  if (message.action === 'downloadFiles') {
    createZipAndDownload(message.files).then(() => {
      sendResponse({ status: 'success' });
    });
    return true; // Keep the message channel open for the async operation
  }
});
