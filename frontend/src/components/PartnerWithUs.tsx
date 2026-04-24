import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Check, Building2, Mail, Phone, Globe, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { LoginForm } from "./auth/LoginForm";
import { RegisterForm } from "./auth/RegisterForm";
import { toast } from "sonner@2.0.3";
import { AddFacilityForm } from "./AddFacilityForm";

export function PartnerWithUs() {
  const { user, updateUserRole } = useAuth();
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'register'>('none');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showAddFacility, setShowAddFacility] = useState(false);

  const packages = [
    {
      name: "Standard",
      price: "99 zł",
      period: "/ miesięcznie",
      description: "Idealny dla małych obiektów sportowych",
      features: [
        "Do 2 obiektów",
        "Podstawowy kalendarz rezerwacji",
        "Powiadomienia email",
        "Podstawowe wsparcie"
      ],
      highlighted: false,
      color: "blue"
    },
    {
      name: "Medium",
      price: "199 zł",
      period: "/ miesięcznie",
      description: "Dla rozwijających się centrów sportowych",
      features: [
        "Do 5 obiektów",
        "Zaawansowany kalendarz",
        "Statystyki rezerwacji",
        "Wsparcie priorytetowe",
        "Płatności online"
      ],
      highlighted: true,
      color: "indigo"
    },
    {
      name: "Premium",
      price: "od 399 zł",
      period: "/ miesięcznie",
      description: "Dla dużych kompleksów i sieci",
      features: [
        "Nielimitowana liczba obiektów",
        "Dedykowany opiekun",
        "API integracyjne",
        "Pełna analityka",
        "Marketing w serwisie",
        "Wsparcie 24/7"
      ],
      highlighted: false,
      color: "purple"
    }
  ];

  // If user logs in while waiting, proceed to payment or contact
  useEffect(() => {
    if (user && selectedPackage && authMode !== 'none') {
        setAuthMode('none');
        handlePackageSelection(selectedPackage);
    }
  }, [user, selectedPackage, authMode]);

  const handlePackageSelection = (pkgName: string) => {
    if (pkgName.includes("Publiczne")) {
        toast.success(`Dziękujemy za zgłoszenie obiektu publicznego!`, {
           description: "Możesz teraz dodać swój obiekt do bazy."
       });
       updateUserRole('owner');
       setShowAddFacility(true);
   } else if (pkgName === "Kontakt") {
        // Just contact
   } else {
       // Simulate Payment Process
       setIsProcessingPayment(true);
       toast.info("Przekierowanie do płatności...", { duration: 2000 });
       setTimeout(() => {
           setIsProcessingPayment(false);
           updateUserRole('owner');
           toast.success(`Płatność za pakiet ${pkgName} przyjęta!`, {
               description: "Twoje konto otrzymało status Właściciela. Możesz teraz dodawać obiekty."
           });
           setShowAddFacility(true);
       }, 3000);
   }
  };

  const handleSelectPackage = (pkgName: string) => {
    setSelectedPackage(pkgName);
    if (user) {
        handlePackageSelection(pkgName);
    } else {
        setAuthMode('login');
    }
  };

  const handleContactClick = () => {
      if (user) {
          toast.success("Wiadomość została wysłana!", {
              description: "Odpowiemy najszybciej jak to możliwe."
          });
      } else {
          setSelectedPackage("Kontakt");
          setAuthMode('login');
      }
  };

  const handleFacilityAdded = () => {
      setShowAddFacility(false);
      setSelectedPackage(null);
  };

  if (showAddFacility) {
      return (
          <div className="py-8">
              <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Współpraca nawiązana!</h2>
                  <p className="text-black font-medium">
                      Twój pakiet: <strong>{selectedPackage}</strong> jest aktywny. Możesz teraz dodać swój pierwszy obiekt.
                  </p>
              </div>
              <AddFacilityForm onSuccess={handleFacilityAdded} onCancel={() => setShowAddFacility(false)} />
          </div>
      );
  }

  if (isProcessingPayment) {
      return (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div>
                  <h3 className="text-2xl font-semibold">Przetwarzanie płatności...</h3>
                  <p className="text-black font-medium">Prosimy nie zamykać tego okna.</p>
              </div>
          </div>
      );
  }

  if (authMode !== 'none' && !user) {
      return (
          <div className="max-w-md mx-auto py-12 px-4">
              <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Wymagane konto partnera</h3>
                  <p className="text-black font-medium">
                      Aby wybrać pakiet <strong>{selectedPackage}</strong>, musisz się zalogować lub utworzyć konto.
                  </p>
              </div>
              {authMode === 'login' ? (
                  <LoginForm 
                      onSwitchToRegister={() => setAuthMode('register')}
                      onSuccess={() => {}} 
                  />
              ) : (
                  <RegisterForm
                      onSwitchToLogin={() => setAuthMode('login')}
                      onSuccess={() => {}}
                  />
              )}
              <Button variant="ghost" className="w-full mt-4" onClick={() => { setAuthMode('none'); setSelectedPackage(null); }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anuluj i wróć do oferty
              </Button>
          </div>
      )
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-8 px-4">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight sm:text-5xl"
        >
          Rozwijaj swój biznes z nami
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-black font-medium max-w-2xl mx-auto"
        >
          Dołącz do tysięcy obiektów sportowych, które zaufały BookingSystem. 
          Zwiększ obłożenie i ułatw klientom rezerwację.
        </motion.p>
      </section>

      {/* Pricing Cards */}
      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative h-full flex flex-col ${pkg.highlighted ? 'border-indigo-500 shadow-lg scale-105 z-10' : ''}`}>
              {pkg.highlighted && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Najczęściej wybierany
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{pkg.price}</span>
                  <span className="text-black font-medium ml-1">{pkg.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`rounded-full p-1 bg-${pkg.color}-100 text-${pkg.color}-600`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                    className="w-full" 
                    variant={pkg.highlighted ? "default" : "outline"}
                    onClick={() => handleSelectPackage(pkg.name)}
                >
                  Wybierz pakiet
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Public Facilities Section */}
      <section className="max-w-4xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="bg-white p-4 rounded-full shadow-sm">
            <Building2 className="w-12 h-12 text-emerald-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Obiekty Publiczne</h3>
            <p className="text-emerald-700 mb-4">
              Zarządzasz orlikiem, szkolną salą gimnastyczną lub świetlicą osiedlową?
              Udostępnij swój obiekt lokalnej społeczności całkowicie za darmo!
            </p>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-emerald-800 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Darmowa rejestracja obiektu
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" /> System rezerwacji dla mieszkańców
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Brak opłat miesięcznych
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Promocja aktywności fizycznej
              </li>
            </ul>
            <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleSelectPackage("Obiekty Publiczne (Darmowy)")}
            >
                Zgłoś obiekt publiczny
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="bg-slate-900 text-white py-16 rounded-3xl mx-4">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">Skontaktuj się z nami</h2>
          <p className="text-slate-300 mb-10 text-lg">
            Chcesz dodać swój obiekt lub dowiedzieć się więcej o możliwościach współpracy?
            Nasz zespół jest do Twojej dyspozycji.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <p className="font-medium">partner@sportbook.pl</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              <p className="font-medium">+48 123 456 789</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <p className="font-medium">www.partner.sportbook.pl</p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            onClick={handleContactClick}
          >
            Napisz do nas
          </Button>
        </div>
      </section>
    </div>
  );
}
