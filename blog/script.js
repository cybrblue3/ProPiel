document.addEventListener('DOMContentLoaded', function() {
    // Animaciones al hacer scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fade-in');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if(elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Ejecutar al cargar la página

    // Acordeón para preguntas frecuentes
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('i');
            
            if(content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.setAttribute('data-feather', 'plus');
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.setAttribute('data-feather', 'minus');
            }
            feather.replace();
        });
    });
    // Formulario de contacto
    const contactForm = document.querySelector('form');
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
            this.reset();
        });
    }

    // Asegurar que feather icons se recarguen en los detalles de servicios
    document.addEventListener('click', function(e) {
        if (e.target.closest('.service-toggle')) {
            setTimeout(() => {
                feather.replace();
            }, 300);
        }
    });
});