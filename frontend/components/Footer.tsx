import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-solid border-t-[#e7f3ef] dark:border-t-primary/10 px-4 sm:px-6 md:px-10 py-8 bg-background-light dark:bg-background-dark">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left max-w-[960px] mx-auto">
        <div>
            <h3 className="font-bold text-[#0d1b17] dark:text-white mb-2">Peluquería Canina</h3>
            <p className="text-sm text-[#4c9a80] dark:text-white/70">Cuidando a tu mejor amigo con amor y profesionalismo.</p>
        </div>
        <div>
            <h3 className="font-bold text-[#0d1b17] dark:text-white mb-2">Enlaces Rápidos</h3>
            <ul className="space-y-1">
            <li><a className="text-sm text-[#4c9a80] dark:text-white/70 hover:text-[#0d1b17] dark:hover:text-white" href="#">Servicios</a></li>
            <li><a className="text-sm text-[#4c9a80] dark:text-white/70 hover:text-[#0d1b17] dark:hover:text-white" href="#">Sobre Nosotros</a></li>
            <li><a className="text-sm text-[#4c9a80] dark:text-white/70 hover:text-[#0d1b17] dark:hover:text-white" href="#">Contacto</a></li>
            </ul>
        </div>
        <div>
            <h3 className="font-bold text-[#0d1b17] dark:text-white mb-2">Contacto</h3>
            <p className="text-sm text-[#4c9a80] dark:text-white/70">Calle Falsa 123, Springfield</p>
            <p className="text-sm text-[#4c9a80] dark:text-white/70">(123) 456-7890</p>
        </div>
        </div>
        <div className="mt-8 text-center text-xs text-[#4c9a80] dark:text-white/50 border-t border-solid border-t-[#e7f3ef] dark:border-t-primary/10 pt-6 max-w-[960px] mx-auto">
        <p>© 2024 Peluquería Canina. Todos los derechos reservados.</p>
        </div>
    </footer>
  );
};

export default Footer;
