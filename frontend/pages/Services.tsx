import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Services: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const { isAuthenticated } = useAuth();

  const services = [
    {
      title: "Baño Higiénico Básico",
      desc: "Incluye: baño con champú hipoalergénico, secado manual y limpieza de oídos.",
      duration: "60 min",
      price: "Desde $25",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpZnT1TZQGqgdvWPJfTulsTilvr9wNzmN3B-PtSFg2cYshrljusCPV_NKiXjHcl8jbOs0Pxjmz6u_soc8Z5mpKWCkPRN_qYzHmrdcFdDXqFipwBCsUWrwCsDGISEjS6OJ0BqlufVjwUO_qxLHcj4DRObkXAV0ZalTkkw-PwR7-Mb__2muwwGj4MGCkLrW2uKD6mdIRWbuDtXUJF4C9PI7ybGSt2gSZuL8d9WX5YApnHtlpYM_Me-3MsxKKkmVYDFvht4b1weogMqw",
      category: "Baño y Secado"
    },
    {
      title: "Corte de Raza a Tijera",
      desc: "Corte estilizado a tijera para realzar las características de la raza.",
      duration: "90 min",
      price: "Desde $45",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9bsuWWLnHuLo7hcanZIX1YCSinTYVoWMjwZmRdebHoDsKZsaDHkmrbBTKMsmVSU_fIfLzYF5tXqGVMMbT06NyCdwN0UaqmmWOT3Wbf3sIiR8P8tw7UFIucQwU-8QkLomq4UmxhDBl11INvKE9kVjiy5Iq1Hl177QpI08vwFvx93BNwPubEPII3tKE2YdedMiXA6omZN40sQ0KTBZPTYLJIV9HBnn5KBJoXc64LW-ic57PAKU_Ma83n8kq0lCTA1CMFwsiz7QgAQE",
      category: "Corte de Pelo"
    },
    {
      title: "Tratamiento Antiparasitario",
      desc: "Tratamiento efectivo para proteger a tu mascota de pulgas y garrapatas.",
      duration: "45 min",
      price: "Desde $30",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7Fcpmv7A7CAQ_kHxUzjyXskylSOSWr4juLLwNJr6C6gs0_XFX02bDj798sImr5PtlG1SYJkUgyulbqfxmeeWDRYFehACk_j5TSnFNArxHEjQMvinogl6E5fmxdPZRPbA9Ynba0hYZcZp1zs75MW2jOkepVpABCrElfmChlmJHyBjfXW9RVlpVrYuWRTI2GEv7wct5vzJrxZuF5SXTvsDRu9BNr9V15xmQB_e43XkQhZThLtACqGF9zrfugG4FI0ZHwwD4k8-iKWc",
      category: "Tratamientos Especiales"
    },
    {
      title: "Pack Completo Premium",
      desc: "El servicio más completo: baño, corte, tratamiento hidratante y pedicura.",
      duration: "120 min",
      price: "Desde $60",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX-vNDbY1iMsta1Ms7hY43dF_oSy_c-y3jzvestEO1dPbZYU8cgma4ggjBuQFDXYAYemIcngvRnk28eAi9_HIPF5d2q38U4WA7H3pYdgVEMY9iOpP3NMt2veWE3e01sr6VUhVje_0keeW3jilwCGJTN1nc2uvkd_KZYpaIX1IaQKa3k0w5nbn3H6xPlppjJHLPbHbEjFuMnAEsLrFBCR27DE4cEMM7wq8raPWQaIfishO2BzqWS_Efbd3xzX5ssGolmGA0PxMW6fo",
      category: "Todos"
    }
  ];

  const filteredServices = activeFilter === 'Todos' 
    ? services 
    : services.filter(s => s.category === activeFilter || s.category === 'Todos');

  const filters = ["Todos", "Baño y Secado", "Corte de Pelo", "Tratamientos Especiales"];

  return (
    <div className="w-full px-4 sm:px-8 md:px-20 lg:px-40 py-8 mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-3 mb-8">
        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-text-light dark:text-text-dark">Nuestros Servicios</h1>
        <p className="text-base font-normal leading-normal text-subtext-light dark:text-subtext-dark">Cuidado experto y con cariño para tu mejor amigo.</p>
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(filter => (
            <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex h-8 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors whitespace-nowrap
                ${activeFilter === filter 
                    ? 'bg-primary/20 text-text-light dark:text-white dark:bg-primary/30' 
                    : 'bg-background-light dark:bg-white/10 text-subtext-light dark:text-subtext-dark hover:bg-primary/10'}`}
            >
                {filter}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {filteredServices.map((service, idx) => (
            <div key={idx} className="flex flex-col gap-4 rounded-xl bg-white dark:bg-white/5 p-4 transition-all hover:shadow-lg border border-transparent dark:border-white/5">
                <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" style={{ backgroundImage: `url("${service.img}")` }}></div>
                <div className="flex flex-col gap-2 flex-grow">
                    <p className="text-lg font-bold leading-normal text-text-light dark:text-text-dark">{service.title}</p>
                    <p className="text-sm font-normal leading-normal text-subtext-light dark:text-subtext-dark">{service.desc}</p>
                    <div className="flex items-center gap-4 text-sm font-medium text-subtext-light dark:text-subtext-dark mt-2">
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">schedule</span>{service.duration}</span>
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">attach_money</span>{service.price}</span>
                    </div>
                </div>
                {isAuthenticated && (
                  <Link to="/book-appointment" className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-text-light gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors">
                      Reservar Ahora
                  </Link>
                )}
            </div>
        ))}
      </div>

      <div className="flex flex-col mt-12">
        <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-text-light dark:text-text-dark pb-6">Preguntas Frecuentes</h2>
        <div className="flex flex-col divide-y divide-border-light dark:divide-border-dark">
            <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-text-light dark:text-text-dark font-medium">
                    <span>¿Con qué frecuencia debo bañar a mi perro?</span>
                    <span className="transition group-open:rotate-180 material-symbols-outlined">expand_more</span>
                </summary>
                <div className="mt-3 text-sm text-subtext-light dark:text-subtext-dark">La frecuencia ideal depende de la raza, el tipo de pelo y el estilo de vida de tu perro. Generalmente, un baño cada 4-6 semanas es suficiente.</div>
            </details>
            <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-text-light dark:text-text-dark font-medium">
                    <span>¿Utilizan productos seguros para mascotas?</span>
                    <span className="transition group-open:rotate-180 material-symbols-outlined">expand_more</span>
                </summary>
                <div className="mt-3 text-sm text-subtext-light dark:text-subtext-dark">Absolutamente. Utilizamos solo champús y acondicionadores hipoalergénicos de alta calidad.</div>
            </details>
            <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-text-light dark:text-text-dark font-medium">
                    <span>¿Qué necesito traer para la cita de mi perro?</span>
                    <span className="transition group-open:rotate-180 material-symbols-outlined">expand_more</span>
                </summary>
                <div className="mt-3 text-sm text-subtext-light dark:text-subtext-dark">Solo necesitas traer a tu perro con su correa. Si tiene alguna condición médica, infórmanos.</div>
            </details>
        </div>
      </div>
    </div>
  );
};

export default Services;
