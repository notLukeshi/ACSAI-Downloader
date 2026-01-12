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
      let name = '';
      const nameSelectors = [
        'strong.sc-bvgPty.flCNNv', // Specific selector from example
        'strong', // Fallback to any strong
        '.filename',
        '[class*="name"]',
        '[class*="title"]'
      ];
      for (const selector of nameSelectors) {
        const nameElement = element.querySelector(selector);
        if (nameElement?.textContent) {
          name = nameElement.textContent.trim();
          break;
        }
      }

      let size = '';
      const sizeSelectors = [
        'span.sc-kUdmhA.epNzMe', // Specific selector from example
        '.sc-dcJsrY.dFYVzJ', // Original selector
        '[class*="size"]',
        '.file-size',
        '[data-size]'
      ];
      
      for (const selector of sizeSelectors) {
        const sizeElement = element.querySelector(selector);
        if (sizeElement?.textContent) {
          size = sizeElement.textContent.trim();
          break;
        }
      }

      if (linkElement && name) {
        const url = linkElement.href;
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
