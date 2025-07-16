import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";

interface AimModeSelectorProps {
  mode: string;
  onStart: () => void;
  onBack: () => void;
}

export const AimModeSelector = ({ mode, onStart, onBack }: AimModeSelectorProps) => {
  const getModeInfo = () => {
    switch (mode) {
      case "gridshot":
        return {
          name: "GridShot",
          description: "Alvos aparecem em sequência em posições fixas. Ideal para iniciantes.",
          rules: [
            "60 segundos de duração",
            "1 alvo por vez",
            "Alvos estáticos",
            "Pontuação baseada em velocidade e precisão"
          ],
          tips: [
            "Mire com calma nos primeiros disparos",
            "Desenvolva um ritmo consistente",
            "Foque na precisão antes da velocidade",
            "Use o centro da tela como referência"
          ]
        };
      case "flick":
        return {
          name: "Flick Shot",
          description: "Alvos aparecem aleatoriamente na tela. Treina flicks rápidos e precisos.",
          rules: [
            "60 segundos de duração",
            "1 alvo por vez",
            "Posições completamente aleatórias",
            "Maior recompensa por flicks rápidos"
          ],
          tips: [
            "Pratique movimentos de pulso",
            "Mantenha o braço relaxado",
            "Antecipe a direção do próximo alvo",
            "Desenvolva memória muscular"
          ]
        };
      case "tracking":
        return {
          name: "Tracking",
          description: "Alvos se movem constantemente. Desenvolve rastreamento suave.",
          rules: [
            "60 segundos de duração",
            "1 alvo em movimento",
            "Alvo rebate nas bordas",
            "Pontuação por tempo de contato"
          ],
          tips: [
            "Use movimentos suaves do mouse",
            "Antecipe a trajetória do alvo",
            "Mantenha o crosshair no centro",
            "Pratique movimentos circulares"
          ]
        };
      case "precision":
        return {
          name: "Precision",
          description: "Alvos muito pequenos para máxima precisão. Modo expert.",
          rules: [
            "60 segundos de duração",
            "1 alvo pequeno por vez",
            "Alvos estáticos",
            "Alta penalidade por erros"
          ],
          tips: [
            "Use DPI baixo para mais controle",
            "Respire antes de atirar",
            "Foque na consistência",
            "Pratique micro-ajustes"
          ]
        };
      default:
        return {
          name: mode,
          description: "Modo de treino personalizado",
          rules: [],
          tips: []
        };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">{modeInfo.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Modo</CardTitle>
            <CardDescription>{modeInfo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Regras:</h4>
                <ul className="space-y-1">
                  {modeInfo.rules.map((rule, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4">
                <Button onClick={() => {
                  console.log(`[AIM MODE SELECTOR] Starting training for mode: ${mode}`);
                  onStart();
                }} size="lg" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Treino
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas de Treino</CardTitle>
            <CardDescription>
              Maximize seus resultados com essas estratégias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {modeInfo.tips.map((tip, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full text-xs flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h5 className="font-semibold mb-2">💡 Lembra-te:</h5>
              <p className="text-sm text-muted-foreground">
                Consistência é mais importante que velocidade. Foque na precisão primeiro e a velocidade virá naturalmente com a prática.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};