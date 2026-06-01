import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

type Lang = "ru" | "en";

const CATEGORIES = [
  {
    key: "cat1",
    ru: "1 категория: Руководители, Заместители (CEO, Deputy CEO)",
    en: "Category 1: Executives, Deputies (CEO, Deputy CEO)",
  },
  {
    key: "cat2",
    ru: "2 категория: Менеджеры среднего звена (Главный бухгалтер, Начальники отделов)",
    en: "Category 2: Middle Management (Chief Accountant, Heads of Departments)",
  },
  {
    key: "cat3",
    ru: "3 категория: Специалисты (Инженер, Аналитик, Программист)",
    en: "Category 3: Specialists (Engineer, Analyst, Programmer)",
  },
  {
    key: "cat4",
    ru: "4 категория: Квалифицированные рабочие (Сварщик, Электрик, Техник)",
    en: "Category 4: Skilled Workers (Welder, Electrician, Technician)",
  },
] as const;

type CatKey = (typeof CATEGORIES)[number]["key"];
type Counts = Record<CatKey, number>;
const emptyCounts: Counts = { cat1: 0, cat2: 0, cat3: 0, cat4: 0 };

const T = {
  ru: {
    title: "Калькулятор квот ИРС (РК)",
    subtitle: "Введите количество сотрудников по категориям — расчёт квот выполняется в реальном времени.",
    staff: "Состав персонала",
    local: "Нац.",
    expats: "Экспаты",
    check: "Проверка квот",
    g12: "1 и 2 категориям",
    g34: "3 и 4 категориям",
    need: (n: number, g: string) => (
      <>Вам необходимо нанять еще <strong>{n}</strong> казахстанцев для выполнения квоты по {g}.</>
    ),
    okGroup: (g: string, c: number, r: number, has: boolean) =>
      `${g}: требования по доле местного содержания соблюдены${has ? ` (${c} из ${r}).` : "."}`,
    now: "Сейчас",
    min: "Требуется минимум",
    c12: "1 и 2 категории",
    c34: "3 и 4 категории",
    total: "Итого",
    foreigners: "Иностранцев",
    locals: "Казахстанцев",
    required: "Требуется",
    norm12: "Норма: ≥ 70% казахстанцев.",
    norm34: "Норма: ≥ 90% казахстанцев.",
    totalAll: "Всего сотрудников",
    totalExp: "Экспатов",
    localShare: "Местное содержание",
  },
  en: {
    title: "Foreign Workforce Quota Calculator (KZ)",
    subtitle: "Enter the number of employees by category — quotas are calculated in real time.",
    staff: "Staff Composition",
    local: "Local",
    expats: "Expats",
    check: "Quota check",
    g12: "categories 1 & 2",
    g34: "categories 3 & 4",
    need: (n: number, g: string) => (
      <>You need to hire <strong>{n}</strong> more Kazakhstani employees to meet the quota for {g}.</>
    ),
    okGroup: (g: string, c: number, r: number, has: boolean) =>
      `${g}: local content requirements are met${has ? ` (${c} of ${r}).` : "."}`,
    now: "Current",
    min: "Required minimum",
    c12: "Categories 1 & 2",
    c34: "Categories 3 & 4",
    total: "Total",
    foreigners: "Foreigners",
    locals: "Kazakhstani",
    required: "Required",
    norm12: "Norm: ≥ 70% local.",
    norm34: "Norm: ≥ 90% local.",
    totalAll: "Total employees",
    totalExp: "Expats",
    localShare: "Local content",
  },
} as const;

function NumInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  return (
    <Input
      aria-label={ariaLabel}
      type="number"
      inputMode="numeric"
      min={0}
      value={value === 0 ? "" : value}
      onChange={(e) => onChange(Math.max(0, parseInt(e.target.value || "0", 10) || 0))}
      placeholder="0"
      className="h-8 px-2 text-sm text-center"
    />
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex items-center rounded-md border bg-muted/30 p-0.5 text-xs font-medium">
      {(["ru", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={cn(
            "rounded px-2 py-0.5 uppercase transition-colors",
            lang === l ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function QuotaAlert({
  t,
  groupLabel,
  required,
  current,
  expats,
}: {
  t: typeof T.ru;
  groupLabel: string;
  required: number;
  current: number;
  expats: number;
}) {
  if (expats === 0 || current >= required) {
    return (
      <Alert className="border-emerald-500/40 bg-emerald-500/10 py-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-emerald-700 dark:text-emerald-400 text-sm">
          {t.okGroup(groupLabel, current, required, expats > 0)}
        </AlertDescription>
      </Alert>
    );
  }
  const diff = required - current;
  return (
    <Alert variant="destructive" className="py-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        {t.need(diff, groupLabel)}
        <div className="mt-0.5 text-xs opacity-80">
          {t.now}: {current} · {t.min}: {required}
        </div>
      </AlertDescription>
    </Alert>
  );
}

function Index() {
  const [lang, setLang] = useState<Lang>("ru");
  const t = T[lang];
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-6 md:py-10">
        <header className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-1 text-xs md:text-base text-muted-foreground">{t.subtitle}</p>
        </header>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4">
            <CardTitle className="text-base">{t.staff}</CardTitle>
            <LangToggle lang={lang} setLang={setLang} />
          </CardHeader>
          <CardContent className="px-2 sm:px-4 pb-3">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_64px_64px] sm:grid-cols-[1fr_96px_96px] items-end gap-2 border-b pb-1.5 text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <div />
              <div className="text-center">{t.local}</div>
              <div className="text-center">{t.expats}</div>
            </div>
            <div className="divide-y">
              {CATEGORIES.map((c) => (
                <div
                  key={c.key}
                  className="grid grid-cols-[1fr_64px_64px] sm:grid-cols-[1fr_96px_96px] items-center gap-2 py-2"
                >
                  <div className="text-xs sm:text-sm leading-snug pr-1">{c[lang]}</div>
                  <NumInput
                    ariaLabel={`${c[lang]} — ${t.local}`}
                    value={locals[c.key]}
                    onChange={(v) => setLocal(c.key, v)}
                  />
                  <NumInput
                    ariaLabel={`${c[lang]} — ${t.expats}`}
                    value={expats[c.key]}
                    onChange={(v) => setExpat(c.key, v)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="mt-4 space-y-2">
          <h2 className="text-base font-semibold">{t.check}</h2>
          <QuotaAlert t={t} groupLabel={t.g12} required={required12} current={locals12} expats={expats12} />
          <QuotaAlert t={t} groupLabel={t.g34} required={required34} current={locals34} expats={expats34} />
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t.c12}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <div>{t.foreigners}: <span className="font-medium text-foreground">{expats12}</span></div>
              <div>{t.locals}: <span className="font-medium text-foreground">{locals12}</span></div>
              <div>{t.required}: <span className="font-medium text-foreground">{required12}</span></div>
              <div className="pt-1 text-xs">{t.norm12}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t.c34}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <div>{t.foreigners}: <span className="font-medium text-foreground">{expats34}</span></div>
              <div>{t.locals}: <span className="font-medium text-foreground">{locals34}</span></div>
              <div>{t.required}: <span className="font-medium text-foreground">{required34}</span></div>
              <div className="pt-1 text-xs">{t.norm34}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t.total}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <div>{t.totalAll}: <span className="font-medium text-foreground">{total}</span></div>
              <div>{t.locals}: <span className="font-medium text-foreground">{totalLocal}</span></div>
              <div>{t.totalExp}: <span className="font-medium text-foreground">{totalExpat}</span></div>
              <div className="pt-1 text-xs">{t.localShare}: {localShare}%</div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
