import { Wrench, Brush, Building, Truck, Utensils, Car, Calculator, Languages, GraduationCap, Stethoscope, Home, ShoppingBag, Phone, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { FC, SVGProps } from "react";

const icons = [
    Wifi,
    Car,
    Utensils,
    Home,
    ShoppingBag,
    Phone,
    Wrench,
    Brush,
    Building,
    Truck,
    Calculator,
    Languages,
    GraduationCap,
    Stethoscope,
]

interface IconItem {
  Icon: 
  React.FC<React.SVGProps<SVGSVGElement>>;
  top: string;
  left: string;
}

  export default function FloatingIcons() {

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30}).map((_, i) =>
        {const Icon = icons[i % icons.length];
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDelay = Math.random() * 20;
        const randomDuration = 10 + Math.random() * 10;
        return (
            <div
            key={i}
            className="absolute"
            style={{ top: `${randomY}%`, left: `${randomX}%`, animation: `float ${randomDuration}s ease-in-out ${randomDelay}s infinite`, opacity: 0.3}}
            >
                <Icon width={30} height={30} className="text-white" />
            </div>
        
        );
    })}
        <style>{`
            @keyframes float {
                0% {
                    transform: translateY(0px) translateX(0px);
                }
                50% {
                    transform: translateY(-40px) translateX(20px);
                }
                100% {
                    transform: translateY(0px) translateX(0px);
                }
            }
        `}</style>
     
    </div>
  );
};