import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Калькулятор квот ИРС — РК" },
      {
        name: "description",
        content:
          "Калькулятор проверки квот на иностранную рабочую силу (ИРС) согласно законодательству Республики Казахстан.",
      },
    ],
  }),
  component: Index,
});

const CATEGORIES = [
  { key: "cat1", label: "1 категория", desc: "Руководители, Заместители (CEO, Deputy CEO)" },
  { key: "cat2", label: "2 категория", desc: "Менеджеры среднего звена (Главный бухгалтер, Начальники отделов)" },
  { key: "cat3", label: "3 категория", desc: "Специалисты (Инженер, Аналитик, Программист)" },
  { key: "cat4", label: "4 категория", desc: "Квалифицированные рабочие (Сварщик, Электрик, Техник)" },
] as const;

type CatKey = (typeof CATEGORIES)[number]["key"];
type Counts = Record<CatKey, number>;

const emptyCounts: Counts = { cat1: 0, cat2: 0, cat3: 0, cat4: 0 };

function StaffInputs({
  title,
  values,
  onChange,
}: {
  title: string;
  values: Counts;
  onChange: (k: CatKey, v: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {CATEGORIES.map((c) => (
          <div key={c.key} className="space-y-2">
            <Label htmlFor={`${title}-${c.key}`} className="font-medium">
              {c.label}
            </Label>
            <p className="text-xs text-muted-foreground">{c.desc}</p>
            <Input
              id={`${title}-${c.key}`}
              type="number"
              min={0}
              value={values[c.key] === 0 ? "" : values[c.key]}
              onChange={(e) => onChange(c.key, Math.max(0, parseInt(e.target.value || "0", 10) || 0))}
              placeholder="0"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuotaAlert({
  groupLabel,
  required,
  current,
  expats,
}: {
  groupLabel: string;
  required: number;
  current: number;
  expats: number;
}) {
  if (expats === 0) {
    return (
      <Alert className="border-emerald-500/40 bg-emerald-500/10">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-emerald-700 dark:text-emerald-400">
          {groupLabel}: иностранных сотрудников нет — требования соблюдены.
        </AlertDescription>
      </Alert>
    );
  }

  if (current >= required) {
    return (
      <Alert className="border-emerald-500/40 bg-emerald-500/10">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-emerald-700 dark:text-emerald-400">
          {groupLabel}: требования по доле местного содержания соблюдены ({current} из {required}).
        </AlertDescription>
      </Alert>
    );
  }

  const diff = required - current;
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Вам необходимо нанять еще <strong>{diff}</strong> казахстанцев для выполнения квоты по {groupLabel}.
        <div className="mt-1 text-xs opacity-80">
          Сейчас: {current} · Требуется минимум: {required}
        </div>
      </AlertDescription>
    </Alert>
  );
}

function Index() {
  const [locals, setLocals] = useState<Counts>(emptyCounts);
  const [expats, setExpats] = useState<Counts>(emptyCounts);

  const expats12 = expats.cat1 + expats.cat2;
  const expats34 = expats.cat3 + expats.cat4;
  const locals12 = locals.cat1 + locals.cat2;
  const locals34 = locals.cat3 + locals.cat4;

  // Кат 1-2: казахстанцев >= 70%, иностранцев <= 30% => required = ceil(expats * 70/30)
  const required12 = useMemo(() => Math.ceil((expats12 * 70) / 30), [expats12]);
  // Кат 3-4: казахстанцев >= 90% => required = expats * 9
  const required34 = useMemo(() => expats34 * 9, [expats34]);

  const setLocal = (k: CatKey, v: number) => setLocals((p) => ({ ...p, [k]: v }));
  const setExpat = (k: CatKey, v: number) => setExpats((p) => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Калькулятор квот ИРС (РК)</h1>
          <p className="mt-2 text-muted-foreground">
            Проверка квот на иностранную рабочую силу согласно законодательству Республики Казахстан.
            Введите количество сотрудников по категориям — расчёт выполняется в реальном времени.
          </p>
        </header>

        <Tabs defaultValue="national" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="national">Национальный персонал</TabsTrigger>
            <TabsTrigger value="expats">Экспаты</TabsTrigger>
          </TabsList>

          <TabsContent value="national">
            <StaffInputs title="Казахстанские сотрудники" values={locals} onChange={setLocal} />
          </TabsContent>

          <TabsContent value="expats">
            <StaffInputs title="Иностранные сотрудники (экспаты)" values={expats} onChange={setExpat} />
          </TabsContent>
        </Tabs>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Проверка квот</h2>
          <QuotaAlert
            groupLabel="1 и 2 категориям"
            required={required12}
            current={locals12}
            expats={expats12}
          />
          <QuotaAlert
            groupLabel="3 и 4 категориям"
            required={required34}
            current={locals34}
            expats={expats34}
          />
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1 и 2 категории</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <div>Иностранцев: <span className="font-medium text-foreground">{expats12}</span></div>
              <div>Казахстанцев сейчас: <span className="font-medium text-foreground">{locals12}</span></div>
              <div>Требуется казахстанцев: <span className="font-medium text-foreground">{required12}</span></div>
              <div className="pt-2 text-xs">Норма: доля казахстанцев ≥ 70% (иностранцев ≤ 30%).</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">3 и 4 категории</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <div>Иностранцев: <span className="font-medium text-foreground">{expats34}</span></div>
              <div>Казахстанцев сейчас: <span className="font-medium text-foreground">{locals34}</span></div>
              <div>Требуется казахстанцев: <span className="font-medium text-foreground">{required34}</span></div>
              <div className="pt-2 text-xs">Норма: доля казахстанцев ≥ 90% (иностранцев ≤ 10%).</div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
