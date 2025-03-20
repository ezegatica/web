import { showError, showInfoDialog } from './ui.js';

let showErrorFn;
let showInfoDialogFn;

export function initShare({showErrorFn: errorFn, showInfoDialogFn: infoDialogFn}) {
    showErrorFn = errorFn || showError;
    showInfoDialogFn = infoDialogFn || showInfoDialog;
    
    // Add handler for WhatsApp sharing button
    const compartirWhatsappBtn = document.getElementById('compartir-whatsapp');
    if (compartirWhatsappBtn) {
        compartirWhatsappBtn.addEventListener('click', captureAndShareImage);
    }
}

/**
 * Capture dialog content as an image and share via WhatsApp
 */
async function captureAndShareImage() {
    const shareBtn = document.getElementById('compartir-whatsapp');
    const originalBtnText = shareBtn.innerHTML;
    try {
        // Show loading state
        shareBtn.innerHTML = `Procesando...`;
        shareBtn.disabled = true;

        // Get the dialog content container
        const detailContainer = document.getElementById('detail-container');

        // Make sure we capture a clean version (hide buttons, etc)
        const dialogFooter = document.querySelector('.dialog-footer');
        const originalFooterDisplay = dialogFooter.style.display;
        dialogFooter.style.display = 'none';

        // Create a temporary wrapper with fixed dimensions (500x500px)
        const tempWrapper = document.createElement('div');
        tempWrapper.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff';
        tempWrapper.style.width = '500px';
        tempWrapper.style.height = '500px';
        tempWrapper.style.padding = '24px';
        tempWrapper.style.borderRadius = '8px';
        tempWrapper.style.position = 'fixed';
        tempWrapper.style.left = '-9999px'; // Position off-screen
        tempWrapper.style.display = 'flex';
        tempWrapper.style.flexDirection = 'column';
        tempWrapper.style.boxSizing = 'border-box';
        tempWrapper.style.overflow = 'hidden';

        // Get the patente value
        const patenteInput = document.getElementById('patente');
        const patenteValue = patenteInput ? patenteInput.value : 'patente_diplomatica';

        // Add page title to the image
        const titleElement = document.createElement('h2');
        titleElement.className = 'text-xl font-bold mb-3';
        titleElement.style.color = document.documentElement.classList.contains('dark') ? '#93c5fd' : '#1d4ed8';
        titleElement.style.textAlign = 'center';
        titleElement.style.margin = '0 0 16px 0';
        titleElement.style.padding = '0';
        titleElement.textContent = `Patente Diplomática: ${patenteValue}`;

        // Create content container with scrolling if needed
        const contentContainer = document.createElement('div');
        contentContainer.style.flex = '1';
        contentContainer.style.overflow = 'auto';
        contentContainer.style.marginBottom = '16px';

        // Clone the content we want to capture
        const clonedContent = detailContainer.cloneNode(true);

        // Adjust spacing in the cloned content for better fit in fixed dimensions
        const spacingElements = clonedContent.querySelectorAll('.space-y-4, .space-y-6, .sm\\:space-y-4, .sm\\:space-y-6');
        spacingElements.forEach(el => {
            el.classList.remove('space-y-4', 'space-y-6', 'sm:space-y-4', 'sm:space-y-6');
            el.classList.add('space-y-3');
        });

        // Add the cloned content to the content container
        contentContainer.appendChild(clonedContent);

        // Add footer with credits
        const footerElement = document.createElement('div');
        footerElement.style.fontSize = '12px';
        footerElement.style.textAlign = 'center';
        footerElement.style.color = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280';
        footerElement.style.marginTop = 'auto';
        footerElement.style.padding = '8px 0 0 0';
        footerElement.style.borderTop = document.documentElement.classList.contains('dark')
            ? '1px solid #374151'
            : '1px solid #e5e7eb';
        footerElement.textContent = 'Capturado en ezegatica.com/patentes';

        // Add all elements to the wrapper
        tempWrapper.appendChild(titleElement);
        tempWrapper.appendChild(contentContainer);
        tempWrapper.appendChild(footerElement);
        document.body.appendChild(tempWrapper);

        // Use html2canvas to capture the content as an image with fixed dimensions
        const canvas = await html2canvas(tempWrapper, {
            backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            width: 500,
            height: 500,
            scale: 2, // Higher resolution
            logging: false,
            useCORS: true
        });

        // Convert the canvas to a data URL and then to a blob
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        // Clean up
        document.body.removeChild(tempWrapper);
        dialogFooter.style.display = originalFooterDisplay;

        // Create a filename for the image
        const filename = `patente_${patenteValue.replace(/\s+/g, '_')}.jpg`;

        // Message text
        const messageText = `Detalles de la patente diplomática: ${patenteValue}`;

        // Convert data URL to Blob
        const fetchResponse = await fetch(imageDataUrl);
        const blob = await fetchResponse.blob();

        // Create a file from the blob
        const imageFile = new File([blob], filename, { type: 'image/jpeg' });

        if (window.devMode) {
            // Open the image in a new tab
            const imageWindow = window.open('', '_blank');
            imageWindow.document.write(`<img src="${imageDataUrl}" alt="Patente Diplomática" />`);
        } else {
            // Check if Web Share API is supported and can share files
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                try {
                    await navigator.share({
                        title: 'Patente Diplomática',
                        text: messageText,
                        url: window.location.href,
                        files: [imageFile]
                    });

                    // Success - no need for additional messaging as the share was performed natively
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        // Only show error if it wasn't a user cancellation
                        console.error('Error sharing:', error);
                        fallbackShare(imageDataUrl, messageText, filename);
                    }
                }
            } else {
                // Use fallback for browsers that don't support Web Share API with files
                fallbackShare(imageDataUrl, messageText, filename);
            }
        }
    } catch (error) {
        console.error('Error capturing image:', error);
        showErrorFn('Ocurrió un error al generar la imagen para compartir.');
    } finally {
        // Reset button state
        shareBtn.innerHTML = originalBtnText;
        shareBtn.disabled = false;
    }
}

/**
 * Fallback sharing method when Web Share API is not available or fails
 * @param {string} imageDataUrl - Data URL of the image
 * @param {string} messageText - Message text to share
 * @param {string} filename - Filename for downloading
 */
function fallbackShare(imageDataUrl, messageText, filename) {
    // Create a temporary link to download the image
    const tempLink = document.createElement('a');
    tempLink.href = imageDataUrl;
    tempLink.download = filename;

    // If we're on mobile, let's try to detect WhatsApp
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Different approaches based on device
    if (isMobile) {
        // On mobile: download image + show specific instructions for WhatsApp
        tempLink.click(); // Download image

        // Encode the message text 
        const encodedMessage = encodeURIComponent(messageText);

        // Open WhatsApp with the message
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');

        // Show mobile-specific instructions
        showInfoDialogFn("Compartir en WhatsApp",
            "1. La imagen se ha descargado a tu dispositivo.<br>" +
            "2. WhatsApp se abrirá en una nueva ventana con el mensaje.<br>" +
            "3. En WhatsApp, toca el botón de adjuntar (clip) y selecciona la imagen descargada.<br><br>" +
            "La imagen se guardó como: " + filename);
    } else {
        // On desktop: just download with instructions
        tempLink.click(); // Download image

        showInfoDialogFn("Imagen generada",
            "La imagen se ha descargado como: " + filename + "<br><br>" +
            "Para compartirla en WhatsApp:<br>" +
            "1. Abre WhatsApp Web o la aplicación de WhatsApp<br>" +
            "2. Selecciona un chat<br>" +
            "3. Adjunta la imagen descargada");
    }
}