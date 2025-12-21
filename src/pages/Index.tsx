import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dices, Users, Shield, Sparkles, ChevronRight, BookOpen, Target } from 'lucide-react';
import sceneBackground from '@/assets/scene-default.jpg';

const features = [
  {
    icon: Dices,
    title: 'Rolagens Narrativas',
    description: 'Dados Fate com spotlight dramático. Resultados que contam histórias.',
  },
  {
    icon: Sparkles,
    title: 'Pontos de Destino',
    description: 'Economia visível. Aspectos invocáveis. Ficção antes da regra.',
  },
  {
    icon: Shield,
    title: 'Segurança Ativa',
    description: 'Cartão X integrado. Linhas e Véus. Cuidado emocional como padrão.',
  },
  {
    icon: Users,
    title: 'Multiplayer',
    description: 'Sincronização em tempo real. Presença. Campanhas persistentes.',
  },
];

export default function Index() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center scanlines"
          style={{ backgroundImage: `url(${sceneBackground})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-display text-7xl md:text-9xl tracking-tight mb-2">
              <span className="text-primary text-glow-primary">#i</span>
              <span className="text-foreground">HUNT</span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1 max-w-24" />
              <span className="text-2xl md:text-3xl font-ui text-muted-foreground tracking-widest">
                VIRTUAL TABLETOP
              </span>
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1 max-w-24" />
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground font-ui text-center max-w-2xl mb-12"
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Caça monstros. Paga aluguel. A mesa online exclusiva para{' '}
            <span className="text-primary">#iHunt</span>.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link to="/vtt">
              <motion.button
                className="group relative px-8 py-4 rounded-lg font-display text-xl 
                         bg-primary text-primary-foreground glow-primary
                         hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-3">
                  Entrar na Mesa
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1, y: [0, 10, 0] } : {}}
            transition={{ 
              opacity: { delay: 1 },
              y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
              <div className="w-1 h-2 rounded-full bg-primary" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-primary text-glow-primary mb-4">
              Feito para #iHunt
            </h2>
            <p className="text-lg text-muted-foreground font-ui max-w-2xl mx-auto">
              Não é uma mesa genérica. Cada detalhe foi pensado para servir à narrativa, 
              à economia de pontos de destino e à segurança dos jogadores.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="glass-panel p-6 group hover:glow-primary transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4
                               group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground font-ui">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-24 px-4 relative border-t border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-secondary text-glow-secondary mb-4">
              Princípios de Design
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: BookOpen, text: 'Aspectos são mais importantes que mapas' },
              { icon: Sparkles, text: 'Pontos de destino devem ser visíveis' },
              { icon: Shield, text: 'Segurança não é opcional' },
              { icon: Target, text: 'Interface serve a narrativa' },
            ].map((principle, index) => {
              const Icon = principle.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-secondary/50 transition-colors"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Icon className="w-6 h-6 text-secondary flex-shrink-0" />
                  <span className="font-ui text-lg">{principle.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-xl">
            <span className="text-primary">#i</span>HUNT
            <span className="text-muted-foreground text-sm font-ui ml-2">VTT v0.1</span>
          </div>
          <p className="text-sm text-muted-foreground font-ui">
            Baseado no sistema Fate. #iHunt © Machine Age Productions.
          </p>
        </div>
      </footer>
    </div>
  );
}
