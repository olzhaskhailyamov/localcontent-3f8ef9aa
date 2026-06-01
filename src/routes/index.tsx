import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

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

function NumInput({
  id,
  value,
  onChange,
  ariaLabel,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  return (
    <Input
      id={id}
      aria-label={ariaLabel}
      type="number"
      inputMode="numeric"
      min={0}
      value={value === 0 ? "" : value}
      onChange={(e) => onChange(Math.max(0, parseInt(e.target.value || "0", 10) || 0))}
      placeholder="0"
      className="h-9"
    />
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
  if (expats === 0 || current >= required) {
    return (
      <Alert className="border-emerald-500/40 bg-emerald-500/10">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-emerald-700 dark:text-emerald-400">
          {groupLabel}: требования по доле местного содержания соблюдены
          {expats > 0 ? ` (${current} из ${required}).` : "."}
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

  const setLocal = (k: CatKey, v: number) => setLocals((p) => ({ ...p, [k]: v }));
  const setExpat = (k: CatKey, v: number) => setExpats((p) => ({ ...p, [k]: v }));

  const expats12 = expats.cat1 + expats.cat2;
  const expats34 = expats.cat3 + expats.cat4;
  const locals12 = locals.cat1 + locals.cat2;
  const locals34 = locals.cat3 + locals.cat4;

  const required12 = useMemo(() => Math.ceil((expats12 * 70) / 30), [expats12]);
  const required34 = useMemo(() => expats34 * 9, [expats34]);

  const totalLocal = locals12 + locals34;
  const totalExpat = expats12 + expats34;
  const total = totalLocal + totalExpat;
  const localShare = total > 0 ? Math.round((totalLocal / total) * 100) : 0;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8 md:py-10">
          <header className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Калькулятор квот ИРС (РК)
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Введите количество сотрудников по категориям — расчёт квот выполняется в реальном времени.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Состав персонала</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop: table */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[1fr_180px_180px] gap-3 border-b pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <div>Категория</div>
                  <div className="text-center">Национальный персонал (чел.)</div>
                  <div className="text-center">Экспаты (чел.)</div>
                </div>
                <div className="divide-y">
                  {CATEGORIES.map((c) => (
                    <div key={c.key} className="grid grid-cols-[1fr_180px_180px] items-center gap-3 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{c.label}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                aria-label={`Подсказка: ${c.desc}`}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              {c.desc}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{c.desc}</p>
                      </div>
                      <NumInput
                        id={`local-${c.key}`}
                        ariaLabel={`${c.label} — национальные`}
                        value={locals[c.key]}
                        onChange={(v) => setLocal(c.key, v)}
                      />
                      <NumInput
                        id={`expat-${c.key}`}
                        ariaLabel={`${c.label} — экспаты`}
                        value={expats[c.key]}
                        onChange={(v) => setExpat(c.key, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile: mini cards */}
              <div className="md:hidden space-y-3">
                {CATEGORIES.map((c) => (
                  <div key={c.key} className="rounded-lg border bg-card p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium">{c.label}</div>
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{c.desc}</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Подсказка: ${c.desc}`}
                            className="shrink-0 text-muted-foreground"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[260px]">
                          {c.desc}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`m-local-${c.key}`} className="text-[11px] text-muted-foreground">
                          Нац.
                        </Label>
                        <NumInput
                          id={`m-local-${c.key}`}
                          ariaLabel={`${c.label} — национальные`}
                          value={locals[c.key]}
                          onChange={(v) => setLocal(c.key, v)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`m-expat-${c.key}`} className="text-[11px] text-muted-foreground">
                          Экспаты
                        </Label>
                        <NumInput
                          id={`m-expat-${c.key}`}
                          ariaLabel={`${c.label} — экспаты`}
                          value={expats[c.key]}
                          onChange={(v) => setExpat(c.key, v)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold">Проверка квот</h2>
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

          <section className="mt-6 grid gap-3 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">1 и 2 категории</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <div>Иностранцев: <span className="font-medium text-foreground">{expats12}</span></div>
                <div>Казахстанцев: <span className="font-medium text-foreground">{locals12}</span></div>
                <div>Требуется: <span className="font-medium text-foreground">{required12}</span></div>
                <div className="pt-1 text-xs">Норма: ≥ 70% казахстанцев.</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">3 и 4 категории</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <div>Иностранцев: <span className="font-medium text-foreground">{expats34}</span></div>
                <div>Казахстанцев: <span className="font-medium text-foreground">{locals34}</span></div>
                <div>Требуется: <span className="font-medium text-foreground">{required34}</span></div>
                <div className="pt-1 text-xs">Норма: ≥ 90% казахстанцев.</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Итого</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <div>Всего сотрудников: <span className="font-medium text-foreground">{total}</span></div>
                <div>Казахстанцев: <span className="font-medium text-foreground">{totalLocal}</span></div>
                <div>Экспатов: <span className="font-medium text-foreground">{totalExpat}</span></div>
                <div className="pt-1 text-xs">Местное содержание: {localShare}%</div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}
