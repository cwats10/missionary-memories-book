import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookPreview } from '@/components/vault/BookPreview';
import { brandConfig } from '@/config/brandConfig';
import { CheckCircle2, Package, Users, BookOpen, ArrowRight } from 'lucide-react';
import type { Page } from '@/hooks/usePages';
import type { PageTemplate } from '@/lib/pdfTemplates';

// ── Static demo data ─────────────────────────────────────────────────────────

const SAMPLE_VAULT = {
  recipient_name: 'Elder James Thompson',
  mission_name: 'Brazil São Paulo South Mission',
  service_start_date: '2022-08-15',
  service_end_date: '2024-08-15',
  vault_type: 'homecoming',
};

const SAMPLE_PAGES: Page[] = [
  {
    id: 'demo-1',
    vault_id: 'demo',
    title: 'From Your Mission President',
    content:
      'Elder Thompson, from the moment you arrived in the field, we knew you were set apart for this work. Your diligence, your faith, and your willingness to go the extra mile marked you as someone truly called of God. The companionships you strengthened, the families you taught, and the quiet service you rendered when no one was watching — those are the things that will last. Thank you for two years of your life given freely and joyfully.',
    image_url: null,
    image_urls: [],
    page_template: 'story' as PageTemplate,
    status: 'approved',
    sort_order: 1,
    contributor_id: null,
    caption: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    vault_id: 'demo',
    title: 'From Mom & Dad',
    content:
      'Two years ago we watched you walk through the airport doors and we cried the whole drive home. Today we watch you walk back through those same doors and we can\'t stop smiling. You left as our boy and you\'ve come home as someone we admire deeply. We have read every letter, saved every email, and prayed over every name you shared. We are so proud of you, Elder. We love you more than words can hold.',
    image_url: null,
    image_urls: [],
    page_template: 'story' as PageTemplate,
    status: 'approved',
    sort_order: 2,
    contributor_id: null,
    caption: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    vault_id: 'demo',
    title: 'A Moment I\'ll Never Forget',
    content:
      'I was serving as your companion the week we taught the Silva family. I watched you sit on their tiny plastic chair in the heat, your white shirt wilting, and teach the Restoration with a quiet confidence that silenced the room. Sister Silva started crying before you finished. I\'ve seen a lot of lessons. That one was different. You\'ll carry that family with you forever, and they\'ll carry you.',
    image_url: null,
    image_urls: [],
    page_template: 'story' as PageTemplate,
    status: 'approved',
    sort_order: 3,
    contributor_id: null,
    caption: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    vault_id: 'demo',
    title: 'From Your Little Sister',
    content:
      'You missed my 8th-grade graduation, the dog\'s birthday (twice), and approximately 730 dinners. I kept a list. But I also got to say "my brother is a missionary" for two whole years and that felt really cool. Everyone at church asked about you. I told them you were the best one out there. I wasn\'t exaggerating. Welcome home, James. I saved you the good chair.',
    image_url: null,
    image_urls: [],
    page_template: 'story' as PageTemplate,
    status: 'approved',
    sort_order: 4,
    contributor_id: null,
    caption: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    vault_id: 'demo',
    title: 'From the Ward',
    content:
      'Elder Thompson, this ward sustained you, prayed for you, and fasted on your behalf more times than you know. In return, you sent letters that strengthened our faith. Brother Carlson read your email at High Priests and there wasn\'t a dry eye. You served in a far-away place but you never left our hearts. Come back and speak — we\'ll be in the front row.',
    image_url: null,
    image_urls: [],
    page_template: 'story' as PageTemplate,
    status: 'approved',
    sort_order: 5,
    contributor_id: null,
    caption: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SampleVault() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 paper-texture pointer-events-none" />

      {/* Header */}
      <header className="border-b border-stone/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            <a href="/" className="font-serif text-xl tracking-wide hover:opacity-80 transition-opacity">
              {brandConfig.name}
            </a>
            <div className="flex items-center gap-3">
              <a href="/auth" className="font-serif-text text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </a>
              <a
                href="/auth?mode=signup"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-serif-text text-sm rounded transition-all hover:opacity-90"
              >
                Create Your Vault
              </a>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </header>

      <main className="px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">

          {/* Demo banner */}
          <div className="mb-10 p-4 bg-gold/10 border border-gold/25 rounded-lg text-center">
            <p className="font-serif-text text-sm text-foreground/80">
              <span className="font-medium text-gold">Sample Vault</span> — This is what a finished {brandConfig.name} book looks like.
              Real vaults are private to the family.
            </p>
          </div>

          {/* Vault header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl mb-1">Mission Memory Vault</h1>
            <p className="text-xl text-muted-foreground">{SAMPLE_VAULT.recipient_name}</p>
            <p className="text-muted-foreground">{SAMPLE_VAULT.mission_name}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: Users, label: 'Contributors', value: '23' },
              { icon: BookOpen, label: 'Memory Pages', value: '18' },
              { icon: Package, label: 'Status', value: 'Delivered' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg border border-border bg-card/50 p-4 text-center">
                <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                <p className="font-serif text-2xl">{value}</p>
                <p className="font-serif-text text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Fulfillment status (delivered) */}
          <div className="mb-10 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-serif text-base mb-1">Book Delivered</h3>
              <p className="font-serif-text text-sm text-muted-foreground">
                This book was printed by Prodigi and delivered to the Thompson family in Provo, UT.
              </p>
              <div className="flex items-center gap-3 mt-3 font-serif-text text-xs">
                {['Submitted', 'Printing', 'Shipped'].map((stage, i) => (
                  <div key={stage} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      {stage}
                    </div>
                    {i < 2 && <div className="w-6 h-px bg-border" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview CTA */}
          <div className="mb-10 text-center">
            <p className="font-serif-text text-sm text-muted-foreground mb-4">
              Tap below to flip through the sample book and see what a finished vault looks like inside.
            </p>
            <BookPreview
              recipientName={SAMPLE_VAULT.recipient_name}
              missionName={SAMPLE_VAULT.mission_name}
              serviceStartDate={SAMPLE_VAULT.service_start_date}
              serviceEndDate={SAMPLE_VAULT.service_end_date}
              pages={SAMPLE_PAGES}
              vaultType={SAMPLE_VAULT.vault_type}
            />
          </div>

          {/* Sample pages preview (scrollable) */}
          <div className="mb-12">
            <h2 className="font-serif text-xl mb-5">Sample Contributions</h2>
            <div className="space-y-4">
              {SAMPLE_PAGES.map((page) => (
                <div key={page.id} className="rounded-lg border border-border bg-card/50 p-5">
                  {page.title && (
                    <h3 className="font-serif text-base mb-2">{page.title}</h3>
                  )}
                  <p className="font-serif-text text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {page.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA section */}
          <div className="rounded-xl border-2 border-dashed border-gold/30 bg-gold/5 p-10 text-center">
            <h2 className="font-serif text-3xl mb-3">Ready to create yours?</h2>
            <p className="font-serif-text text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              A vault takes minutes to set up. Invite family and friends to contribute, then
              approve and print a museum-quality hardcover that will be read for generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/auth?mode=signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-serif-text text-sm tracking-[0.08em] rounded transition-all hover:opacity-90 hover:scale-[1.02] shadow-elegant"
              >
                Create Your Vault
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 border border-foreground/20 text-foreground font-serif-text text-sm tracking-[0.08em] rounded transition-all hover:border-gold/50 hover:bg-gold/5"
              >
                Learn More
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6">
              {['Standard Hardcover from $149', 'Heirloom Edition from $449', 'Digital PDF from $40'].map((detail) => (
                <span key={detail} className="flex items-center gap-2 font-serif-text text-xs text-muted-foreground">
                  <span className="text-gold/50 text-[7px]">◆</span>
                  {detail}
                </span>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
