import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { type Variants, motion } from "motion/react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stats = [
  { icon: Users, label: "Students Enrolled", value: "1,200+" },
  { icon: Award, label: "Years of Excellence", value: "25+" },
  { icon: BookOpen, label: "Subjects Offered", value: "30+" },
  { icon: Clock, label: "Results Published", value: "100%" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="flex-1">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden school-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-navy/5 via-transparent to-gold/5 pointer-events-none" />

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-navy/8 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto text-center"
          >
            {/* School emblem */}
            <motion.div variants={itemVariants} className="mb-4">
              <img
                src="/assets/generated/school-emblem-transparent.dim_120x120.png"
                alt="Pankaj Vidyalaya Chopda Emblem"
                className="w-20 h-20 mx-auto object-contain"
              />
            </motion.div>

            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold-muted/60 text-sm font-medium text-amber-800 mb-6"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Official Result Portal</span>
            </motion.div>

            {/* School name */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-4"
            >
              Pankaj{" "}
              <span
                className="relative inline-block"
                style={{
                  color: "oklch(var(--navy))",
                }}
              >
                Vidyalaya
              </span>
              <br />
              <span
                style={{ color: "oklch(var(--gold))" }}
                className="font-display"
              >
                Chopda
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Nurturing young minds with knowledge and values since 1999. Check
              your academic results quickly and securely.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => navigate({ to: "/results" })}
                className="navy-gradient text-white shadow-card hover:shadow-card-hover transition-all duration-200 gap-2 px-8 font-semibold"
                data-ocid="home.check_result_button"
              >
                <Search className="w-5 h-5" />
                Check Your Result
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: "/admin" })}
                className="border-border bg-card hover:bg-secondary transition-all duration-200 gap-2 px-8 font-semibold"
                data-ocid="home.admin_login_button"
              >
                <Shield className="w-5 h-5" />
                Admin Login
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary mb-3">
                  <stat.icon
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--navy))" }}
                  />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            How to Check Your Result
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Follow these simple steps to access your academic result
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              step: "01",
              title: "Select Your Class",
              desc: "Choose your class from the dropdown list of available exams.",
            },
            {
              step: "02",
              title: "Choose the Exam",
              desc: "Select the specific exam you want to view results for.",
            },
            {
              step: "03",
              title: "Enter Roll Number",
              desc: "Type your roll number and click Search to view your result.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative bg-card border border-border rounded-xl p-6 shadow-xs hover:shadow-card transition-shadow"
            >
              <span
                className="font-display text-5xl font-bold leading-none absolute -top-3 right-4 select-none"
                style={{ color: "oklch(var(--gold) / 0.2)" }}
              >
                {item.step}
              </span>
              <p
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "oklch(var(--gold))" }}
              >
                Step {item.step}
              </p>
              <h3 className="font-semibold text-foreground mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-center mt-10"
        >
          <Button
            size="lg"
            onClick={() => navigate({ to: "/results" })}
            className="navy-gradient text-white shadow-card hover:shadow-card-hover transition-all duration-200 gap-2 px-8 font-semibold"
            data-ocid="home.check_result_button"
          >
            <Search className="w-5 h-5" />
            Check Your Result Now
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
