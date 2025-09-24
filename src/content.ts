interface Attachment {
    id: string;
    name: string;
    size: string;
    url: string;
  }
  
  function findAttachments(): Attachment[] {
    const attachments: Attachment[] = [];
    const attachmentElements = document.querySelectorAll('.component-attachment');
  
    attachmentElements.forEach((element) => {
      const linkElement = element.querySelector('a');
      const nameElement = element.querySelector('strong');
      const sizeElement = element.querySelector<HTMLElement>('.sc-dcJsrY.dFYVzJ');
  
      if (linkElement && nameElement && sizeElement) {
        const url = linkElement.href;
        const name = nameElement.innerText;
        const size = sizeElement.innerText;
  
        const absoluteUrl = new URL(url, window.location.origin).href;
  
        attachments.push({
          id: absoluteUrl, // Use the absolute URL as a unique ID
          name,
          size,
          url: absoluteUrl,
        });
      }
    });
  
    return attachments;
  }
  
  chrome.runtime.onMessage.addListener((request: { action: string }, _sender, sendResponse) => {
    if (request.action === 'findAttachments') {
      const attachments = findAttachments();
      sendResponse({ attachments });
    }
    return true;
  });
