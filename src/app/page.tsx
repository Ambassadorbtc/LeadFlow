import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Users,
} from "lucide-react";
import { createClient } from "@/app/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Streamline Your Sales Process
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our CRM dashboard helps you manage your pipeline, track deals, and
              close more sales with an intuitive interface.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ClipboardList className="w-6 h-6" />,
                title: "Pipeline Management",
                description:
                  "Visualize your sales pipeline with customizable stages",
              },
              {
                icon: <DollarSign className="w-6 h-6" />,
                title: "Deal Tracking",
                description: "Monitor deal values and closing timelines",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Contact Management",
                description: "Keep all your customer information in one place",
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Performance Analytics",
                description: "Track your sales metrics and team performance",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50%</div>
              <div className="text-blue-100">Increase in Deal Closure</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">30%</div>
              <div className="text-blue-100">Less Time on Admin</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-blue-100">Active Sales Teams</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of sales teams who use our CRM to manage their
            pipeline and close more deals.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Access Your Dashboard
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
