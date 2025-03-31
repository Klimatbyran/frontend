import {
  Database,
  Lock,
  Mail,
  Server,
  FileText,
  Building2,
  MapPin,
  LucideIcon,
} from "lucide-react";

// Reusable components
interface DataCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

const DataCard = ({
  icon,
  title,
  description,
  bgColor,
  borderColor,
  iconColor,
}: DataCardProps) => (
  <div className={`${bgColor} rounded-lg p-6 border ${borderColor}`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={iconColor}>{icon}</div>
      <h3 className="text-lg font-light text-white">{title}</h3>
    </div>
    <p className="text-gray-300">{description}</p>
  </div>
);

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
  iconColor: string;
}

const FeatureItem = ({ icon, text, iconColor }: FeatureItemProps) => (
  <li className="flex items-center gap-3 text-gray-300">
    <div className={iconColor}>{icon}</div>
    <span>{text}</span>
  </li>
);

interface ProductCardProps {
  title: string;
  description: string;
  features: { icon: React.ReactNode; text: string }[];
  iconColor: string;
  bgColor: string;
  borderColor: string;
  actions: React.ReactNode;
  icon: React.ReactNode;
}

const ProductCard = ({
  title,
  description,
  features,
  iconColor,
  bgColor,
  borderColor,
  actions,
  icon,
}: ProductCardProps) => (
  <div
    className={`rounded-2xl border ${borderColor} ${bgColor} p-8 shadow-lg hover:${bgColor.replace(
      "bg-",
      "bg-"
    )}/80 transition-colors`}
  >
    <div className="flex items-center gap-4">
      <div
        className={`rounded-lg bg-black-3 p-3`}
      >
        {icon}
      </div>
      <h2 className="text-2xl font-light text-white">{title}</h2>
    </div>
    <p className="mt-4 text-gray-300">{description}</p>
    <ul className="mt-8 space-y-3">
      {features.map((feature, index) => (
        <FeatureItem
          key={index}
          icon={feature.icon}
          text={feature.text}
          iconColor={iconColor}
        />
      ))}
    </ul>
    <div className="mt-8 space-y-4">{actions}</div>
  </div>
);

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => (
  <div>
    <h3 className="text-lg font-light text-white">{question}</h3>
    <p className="mt-2 text-gray-300">{answer}</p>
  </div>
);

function ProductsPage() {
  // Data for data cards
  const dataCards = [
    {
      icon: <Building2 className="h-5 w-5" />,
      title: "Corporate Data",
      description:
        "Carbon emissions data and environmental metrics from Swedish companies",
      bgColor: "bg-blue-5/50",
      borderColor: "border-blue-4",
      iconColor: "text-blue-2",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Sustainability Reports",
      description:
        "Direct links to corporate sustainability and environmental reports",
      bgColor: "bg-orange-5/50",
      borderColor: "border-orange-4",
      iconColor: "text-orange-2",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Municipality Data",
      description: "Environmental and climate data from Swedish municipalities",
      bgColor: "bg-green-5/50",
      borderColor: "border-green-4",
      iconColor: "text-green-2",
    },
  ];

  // Data for FAQ items
  const faqItems = [
    {
      question: "What data is included?",
      answer:
        "Our database includes corporate carbon emissions data, direct links to sustainability reports, environmental metrics, and comprehensive climate data from Swedish municipalities. Perfect for researchers, analysts, and organizations tracking environmental impact.",
    },
    {
      question: "How often is the data updated?",
      answer:
        "Free database dumps are updated every 6 months. Direct API access provides real-time access to our latest data, including newly published reports and updated emissions data.",
    },
    {
      question: "How can I get started?",
      answer:
        "Contact us via email to discuss your needs. We'll help you choose between our free database dumps or direct API access based on your requirements and provide you with all necessary documentation.",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-light tracking-tight text-white sm:text-6xl">
              Access Climate Impact Data
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Get access to a comprehensive climate database, featuring
              corporate emissions data, sustainability reports, and municipal
              environmental metrics through our API.
            </p>
            <a
              href="https://api.klimatkollen.se/api/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center text-orange-3 hover:text-orange-2 transition-colors"
            >
              View API Documentation →
            </a>
          </div>
        </div>
      </div>

      {/* Data Overview Section */}
      <div className="mx-auto max-w-7xl px-6 mb-16 lg:px-8">
        <h2 className="text-2xl font-light text-white text-center mb-8">
          Available Data
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dataCards.map((card, index) => (
            <DataCard key={index} {...card} />
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Free Version */}
          <ProductCard
            title="Free Database Access"
            description="Access our comprehensive climate database through bi-yearly data dumps, perfect for research and analysis."
            features={[
              {
                icon: <Server className="h-5 w-5" />,
                text: "Complete database export every 6 months",
              },
              {
                icon: <FileText className="h-5 w-5" />,
                text: "CSV and JSON formats",
              },
              {
                icon: <Database className="h-5 w-5" />,
                text: "Historical data included",
              },
            ]}
            iconColor="text-blue-2"
            bgColor="bg-black-2"
            borderColor="border-blue-4"
            icon={<Database className="h-6 w-6 text-blue-2" />}
            actions={
              <a
                href="mailto:contact@klimatkollen.se"
                className="mt-8 inline-flex items-center justify-center rounded-md bg-blue-3 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-2 w-full transition-colors"
              >
                Get Access
              </a>
            }
          />

          {/* Premium Version */}
          <ProductCard
            title="Direct API Access"
            description="Real-time access to our climate database through our documented REST API with comprehensive endpoints."
            features={[
              {
                icon: <Server className="h-5 w-5" />,
                text: "Real-time data access",
              },
              {
                icon: <FileText className="h-5 w-5" />,
                text: "Full API documentation",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                text: "Secure API endpoints",
              },
              { icon: <Mail className="h-5 w-5" />, text: "Priority support" },
            ]}
            iconColor="text-orange-2"
            bgColor="bg-black-2"
            borderColor="border-orange-4"
            icon={<Server className="h-6 w-6 text-orange-2" />}
            actions={
              <>
                <a
                  href="https://api.klimatkollen.se/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-orange-5 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-orange-4 w-full transition-colors"
                >
                  View API Documentation
                </a>
                <a
                  href="mailto:contact@klimatkollen.se"
                  className="inline-flex items-center justify-center rounded-md bg-orange-3 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-orange-2 w-full transition-colors"
                >
                  Contact for Pricing
                </a>
              </>
            }
          />
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-4xl mt-24 mb-16">
          <h2 className="text-3xl font-light text-center mb-12 text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {faqItems.map((item, index) => (
              <FAQItem key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
