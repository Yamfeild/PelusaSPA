import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 py-5 max-w-[1400px]">
        {/* Hero */}
        <div className="mt-5 rounded-xl overflow-hidden relative">
            <div className="flex min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex-col gap-6 bg-contain sm:bg-cover bg-center sm:bg-[center_20%] bg-no-repeat items-center justify-center p-4 sm:p-6 md:p-8 text-center" 
                 style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDgvlX9-fMVJzRXA75mdC5Lxg-gJcmb_xQ6kbU-qcDBLLduIEM7fqYZlv_dzalb9Xc9rPwt2cjRJJhMnoZ9dwoZw1iqtfenbMiC8VzBK7oFea-rKJA2Stm53J5Klus4URY-EPToF6C9MG6cd8lIJrh8AYGDAb_aGMHuxNeGVde04tj6Nv9451HiKZIx-NPnMNaYRSECfmbB9C6xd2zE112XKL7kwdsEkg8AERcofMZrxlnFSXYWhVEA1_CScM_Vvt8mGUWWrC-IaNE")' }}>
                <div className="flex flex-col gap-2 max-w-2xl z-10 mt-auto">
                    <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] drop-shadow-lg">
                    Donde Tu Mejor Amigo Recibe el Mejor Cuidado
                    </h1>
                    <h2 className="text-white text-sm sm:text-base font-normal leading-normal drop-shadow-md">
                    Ofrecemos servicios de peluquería premium en un ambiente seguro y amigable para tu mascota.
                    </h2>
                </div>
                <Link to="/book-appointment" className="z-10 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 sm:h-12 sm:px-5 bg-primary text-[#0d1b17] text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-colors shadow-lg mb-4">
                    <span className="truncate">Reservar una Cita</span>
                </Link>
            </div>
        </div>

        {/* Services Summary */}
        <section className="mt-10">
            <h2 className="text-[#0d1b17] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Nuestros Servicios</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 p-4">
                <div className="flex flex-col gap-3 pb-3">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDypds7gjzaRO_twlxRuzEdcbC63shIhp2qg4DLWeHx71cCyrOpp3z5eB6D7lV4iZD_5ULQrAPl-0P8artWP5ATNMpfSp6YKSgH5OAMeWKP_Y9XAI2rgq7sHu5fs90o5wQgG7XKbmGt8vpOf51HeKn-fTWXNpnCX_nuhkD_MIw9SxGfFvB0rGN4ljSUKyiHslf4J781B-VrMwFdn0mTc_zTTMo-zTDKJtVZAo4Flm-Dyi19G50hXzaZcCM0GOEvheqt_JXGCL8ZIno")' }}></div>
                    <div>
                        <p className="text-[#0d1b17] dark:text-white text-base font-medium leading-normal">Corte Completo</p>
                        <p className="text-[#4c9a80] dark:text-white/70 text-sm font-normal leading-normal">Un corte de estilo completo, baño, secado y corte de uñas para un look fresco.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 pb-3">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBoU95BmXz10ftVwGpNZv-6ayGtUg9BCJ4SSWkL3pxk_xFkotS1wxonUyCpL6VQ0ubDks3wEtwcNOgLZal0ZS6GMa2Syt9gRbWM9r0bifgqBzE4WnBdhJp0S3OR1bqOMgnlfTDJtvb-eCSFExinLB4DxqJOQt6fknZ3-1tEw_BAqCH34o4-kEJt7o6YCUY3wHxFIkz7Up_qc7NjtXDfN8btd-wixdiYMyrS_nm533pNZvVhRU2On6FDMmWwf_XSAGb_SwSx4bERpQ4")' }}></div>
                    <div>
                        <p className="text-[#0d1b17] dark:text-white text-base font-medium leading-normal">Baño y Cepillado</p>
                        <p className="text-[#4c9a80] dark:text-white/70 text-sm font-normal leading-normal">Un baño refrescante con productos de alta calidad y un cepillado profundo.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 pb-3">
                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLmP6drdLLgC11wxuoIPfrxFl8fSoGDdAsqX3D_XxghgquFYFxW7tsARKwLH--OzjB9a0vMIHokiNNDRFY3WgMLR2tJr6EbD4L_5E9ZSS0wcQoCA_Fw-mQvlyLfwbVL8sZK6Xa7zx9wWxDNAJ1SceY6TTP6gc21oTJtAV29Imq2l1txTYH4wokdz85h-mad0FEloYBw6fBMnUvKzBGDhiRg01PATs0B0CBZJsWnGQUNpe3u2fp0VvUIS-nqV1qzfx2zQ47LcPPq08")' }}></div>
                    <div>
                        <p className="text-[#0d1b17] dark:text-white text-base font-medium leading-normal">Tratamientos Especiales</p>
                        <p className="text-[#4c9a80] dark:text-white/70 text-sm font-normal leading-normal">Tratamientos de spa, cuidado de patas y soluciones para pieles sensibles.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Gallery */}
        <section className="mt-10">
            <h2 className="text-[#0d1b17] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Galería de Clientes Felices</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl hover:scale-105 transition-transform" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBX4x6_p9vLfrzHTbENuihUuF988UwwUWmbjD_GIqeTiXxnKHxQ5LCH6ASufdIXb2_9f9Zm0rm_2TkN9RN2fE_c2u2HOXufN4a130gM-DGxU3iwhaFekHj-WzFxjj3tXPBPWdv3madjQIKVeqdPEY_QdxbuVzuygYJL1a8iKdE7LWsJ87apmLqgunDSW_cTNvBiUreYDbRh4Z1HYq_172AYhPARnnkSG_jdRCWyXXTUDx7Q7N1Bs2nt-ViJloAOTAna-OT1OqUrPmE")' }}></div>
                <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl hover:scale-105 transition-transform" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmneGDK_BnK8UdMAkddvNKEVvauVwE6_s5fCuoPB1Gz1a5Sdc61NSrdbYZPM-tP04vulseFIlqKE1IUVk1RdgMn31-O3N1SqeccvBaK_ZDIwiuqcA7DRnx-BgUW6toNUlU8Jmy8fOfd_IDxUOQV4Gt4_kZYnEQbGpY8i6S6XbLecTuB5ZuqhaidPRlf_RtWYtdl2QeQXg1zNf6laoOoPfqJ3Qo74xjLHyRs2AJMfXTBAp9mzKnGAMWlrvxtYzPbgEtSQyR0MRgU94")' }}></div>
                <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl hover:scale-105 transition-transform" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCvR8DUwlEcrXppL3X5-0CvKbax9ZWdBDrHLnwWLrxA7BVSfe6nEZh8_2pNYNeyWHSHcFSCn59BycnLj_DuPvA3a5Ujp3_AzY1Vbb_NjbN4p6M1M070xCV5eVadKoI_Khn1h2U9xl2ZISa1svlVPir4OXRfOT5AfGYXCNqQsyKhjpzjI-ThRuFa9U1LqwOkgiW6ZhuenvxR3Q__HHL-K-cllyiPUI0pv83Gkk92h_xSzLkx1n0rAey901IAxCRCtAzzvuv87BL40y4")' }}></div>
                <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl hover:scale-105 transition-transform" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDYM3dej34CfdQzuSzDdd6aWGGSorDCQ_ZfBzLIqdMYSsvS5EvGAnWpkwzhLvk4jiy3y-sUTc5rOkcNFfh4tpjfEZM0SXtC7cFzWW2m2prAmc1aI9Y-qSX-sumnUiGQlyDVKwYzDk8sKGE0oCc0mmIM7OJpPYL-WTHiMcotQDKczhMg4kaOQl92ruFZ3jmUH-x0t_Q3JbeLDAkuGdDTtjoyM7ACFRmUoOpEFyPOzO32GgePLciZdykHEGM1gNHtLgX4sBZbP2I6EcI")' }}></div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
