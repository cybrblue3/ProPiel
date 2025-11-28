
class CustomServicios extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .service-card {
          transition: all 0.3s ease;
          border-radius: 0.5rem;
          overflow: hidden;
          position: relative;
        }
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .service-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 1rem;
          color: #3B82F6;
        }
        .service-details {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s ease;
          background-color: #f8fafc;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .service-details.open {
          max-height: 1000px;
        }
        .details-content {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .details-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .details-image {
          border-radius: 0.5rem;
          overflow: hidden;
          height: 200px;
        }
        .details-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .service-toggle {
          background-color: #3B82F6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          margin-top: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .service-toggle:hover {
          background-color: #2563EB;
        }
        .service-list {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .service-list li {
          margin-bottom: 0.5rem;
        }
      </style>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Dermatología -->
        <div class="service-card bg-white p-6 shadow-md fade-in">
          <div class="flex flex-col items-center text-center">
            <img src="http://static.photos/medical/200x200/1" alt="Dermatología" class="service-icon rounded-full">
            <h3 class="text-xl font-bold text-gray-800 mb-2">Dermatología</h3>
            <p class="text-gray-600">Diagnóstico y tratamiento integral de enfermedades de la piel, cabello y uñas.</p>
            <button class="service-toggle" onclick="this.closest('.service-card').querySelector('.service-details').classList.toggle('open'); this.textContent = this.textContent.includes('Ver') ? 'Ocultar detalles' : 'Ver detalles'; feather.replace()">
              Ver detalles <i data-feather="chevron-down"></i>
            </button>
          </div>
          <div class="service-details">
            <div class="details-content">
              <div class="details-text">
                <h4 class="font-bold mb-2">Tratamientos disponibles:</h4>
                <ul class="service-list">
                  <li>Diagnóstico de cáncer de piel</li>
                  <li>Tratamiento de acné</li>
                  <li>Psoriasis y eccema</li>
                  <li>Dermatitis atópica</li>
                  <li>Alopecia y caída de cabello</li>
                  <li>Enfermedades de las uñas</li>
                </ul>
              </div>
              <div class="details-image">
                <img src="http://static.photos/medical/640x360/1" alt="Tratamiento dermatológico">
              </div>
            </div>
          </div>
        </div>

        <!-- Tamiz -->
        <div class="service-card bg-white p-6 shadow-md fade-in">
          <div class="flex flex-col items-center text-center">
            <img src="http://static.photos/medical/200x200/2" alt="Tamiz" class="service-icon rounded-full">
            <h3 class="text-xl font-bold text-gray-800 mb-2">Tamiz</h3>
            <p class="text-gray-600">Exámenes preventivos para detección temprana de problemas dermatológicos.</p>
            <button class="service-toggle" onclick="this.closest('.service-card').querySelector('.service-details').classList.toggle('open'); this.textContent = this.textContent.includes('Ver') ? 'Ocultar detalles' : 'Ver detalles'; feather.replace()">
              Ver detalles <i data-feather="chevron-down"></i>
            </button>
          </div>
          <div class="service-details">
            <div class="details-content">
              <div class="details-text">
                <h4 class="font-bold mb-2">Exámenes disponibles:</h4>
                <ul class="service-list">
                  <li>Dermatoscopia digital</li>
                  <li>Mapeo de lunares</li>
                  <li>Biopsias cutáneas</li>
                  <li>Test de alergias</li>
                  <li>Análisis capilar</li>
                  <li>Evaluación de uñas</li>
                </ul>
              </div>
              <div class="details-image">
                <img src="http://static.photos/medical/640x360/2" alt="Examen dermatológico">
              </div>
            </div>
          </div>
        </div>

        <!-- Podología -->
        <div class="service-card bg-white p-6 shadow-md fade-in">
          <div class="flex flex-col items-center text-center">
            <img src="http://static.photos/medical/200x200/3" alt="Podología" class="service-icon rounded-full">
            <h3 class="text-xl font-bold text-gray-800 mb-2">Podología</h3>
            <p class="text-gray-600">Cuidado especializado de los pies, tratamiento de uñas encarnadas, callos y más.</p>
            <button class="service-toggle" onclick="this.closest('.service-card').querySelector('.service-details').classList.toggle('open'); this.textContent = this.textContent.includes('Ver') ? 'Ocultar detalles' : 'Ver detalles'; feather.replace()">
              Ver detalles <i data-feather="chevron-down"></i>
            </button>
          </div>
          <div class="service-details">
            <div class="details-content">
              <div class="details-text">
                <h4 class="font-bold mb-2">Procedimientos:</h4>
                <ul class="service-list">
                  <li>Tratamiento de hongos en uñas</li>
                  <li>Eliminación de callos y juanetes</li>
                  <li>Uñas encarnadas</li>
                  <li>Pie diabético</li>
                  <li>Ortesis plantares</li>
                  <li>Cirugía podológica menor</li>
                </ul>
              </div>
              <div class="details-image">
                <img src="http://static.photos/medical/640x360/3" alt="Tratamiento podológico">
              </div>
            </div>
          </div>
        </div>
      </div>
`;
    
    // Feather icons will be replaced when the main script runs
  }
}
customElements.define('custom-servicios', CustomServicios);