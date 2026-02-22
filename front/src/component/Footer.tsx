// @ts-nocheck
import { useTranslation } from 'react-i18next';
import FooterBoutton from './footerBoutton';

function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="w-full shadow-md sticky bottom-0 z-50 bg-white">
           <div className="flex flex-row justify-around items-center px-4 py-4">
            <FooterBoutton href="/mon-programme-sport" title={t('footer.sport')} svgPath="M6 5v14h3v-6h6v6h3V5h-3v6H9V5zM3 15a1 1 0 0 0 1 1h1V8H4a1 1 0 0 0-1 1v2H2v2h1v2zm18-6a1 1 0 0 0-1-1h-1v8h1a1 1 0 0 0 1-1v-2h1v-2h-1V9z" svgFill="#1F2937" />
           
            <FooterBoutton href="/scan-exo" title={t('footer.scan')} svgPath="M3 4v5h2V5h4V3H4a1 1 0 0 0-1 1zm18 5V4a1 1 0 0 0-1-1h-5v2h4v4h2zm-2 10h-4v2h5a1 1 0 0 0 1-1v-5h-2v4zM9 21v-2H5v-4H3v5a1 1 0 0 0 1 1h5zM2 11h20v2H2z" svgFill="#1F2937" />
            <FooterBoutton href="/mon-programme-alimentaire" title={t('footer.food')} svgPath="M12 16.114c-3.998-5.951-8.574-7.043-8.78-7.09L2 8.75V10c0 7.29 3.925 12 10 12 5.981 0 10-4.822 10-12V8.75l-1.22.274c-.206.047-4.782 1.139-8.78 7.09zM11.274 3.767c-1.799 1.898-2.84 3.775-3.443 5.295 1.329.784 2.781 1.943 4.159 3.685 1.364-1.76 2.826-2.925 4.17-3.709-.605-1.515-1.646-3.383-3.435-5.271L12 3l-.726.767z" svgFill="#1F2937" />
            <FooterBoutton href="/evolution" title={t('footer.evolution')} svgPath="M2 21h20v-2H2v2zM20 8l-5 5-3-3-5 5v3.5l5-5 3 3 5-5V8z" svgFill="#1F2937" />
            <FooterBoutton href="/communaute" title={t('footer.social')} svgPath="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" svgFill="#1F2937" />
            </div>
        </footer>
    );
}

export default Footer;