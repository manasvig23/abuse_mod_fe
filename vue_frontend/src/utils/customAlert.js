export function customAlert(message) {
  // Create custom modal
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `
  
  const modal = document.createElement('div')
  modal.style.cssText = `
    background: white;
    border-radius: 20px;
    padding: 0;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.4s ease;
  `
  
  const header = document.createElement('div')
  header.style.cssText = `
    padding: 20px 24px;
    border-bottom: 1px solid #e9ecef;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px 20px 0 0;
  `
  header.innerHTML = `
    <h3 style="margin: 0; color: white; font-size: 18px; font-weight: 600;">
      🛡️ SafeSpace
    </h3>
  `
  
  const body = document.createElement('div')
  body.style.cssText = `
    padding: 24px;
    color: #2c3e50;
    font-size: 15px;
    line-height: 1.6;
  `
  body.textContent = message
  
  const footer = document.createElement('div')
  footer.style.cssText = `
    padding: 16px 24px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    background: #f8f9fa;
    border-radius: 0 0 20px 20px;
  `
  
  const button = document.createElement('button')
  button.textContent = 'OK'
  button.style.cssText = `
    padding: 10px 24px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  `
  
  button.addEventListener('mouseover', () => {
    button.style.transform = 'translateY(-2px)'
    button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
  })
  
  button.addEventListener('mouseout', () => {
    button.style.transform = 'translateY(0)'
    button.style.boxShadow = 'none'
  })
  
  button.addEventListener('click', () => {
    overlay.remove()
  })
  
  footer.appendChild(button)
  modal.appendChild(header)
  modal.appendChild(body)
  modal.appendChild(footer)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)
  
  // Add styles
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `
  document.head.appendChild(style)
  
  // Return promise for chaining
  return new Promise((resolve) => {
    button.addEventListener('click', () => resolve())
  })
}

// Override default alert globally
window.alert = customAlert