import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  HelpCircle,
  Share2,
  Users,
  Image,
  FileText,
  Camera,
  ThumbsUp,
  ThumbsDown,
  GripVertical,
  Eye,
  Download,
  ShoppingCart,
  Settings,
  UserPlus,
  BookOpen,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = 'overview' | 'sharing' | 'contributions' | 'review' | 'finish' | 'tips';

interface TabDef {
  id: Tab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabDef[] = [
  { id: 'overview',       label: 'Overview',      icon: BookOpen    },
  { id: 'sharing',        label: 'Sharing',        icon: Share2      },
  { id: 'contributions',  label: 'Contributions',  icon: Users       },
  { id: 'review',         label: 'Review',         icon: ThumbsUp    },
  { id: 'finish',         label: 'Finish',         icon: ShoppingCart },
  { id: 'tips',           label: 'Tips',           icon: Lightbulb   },
];

// ─── Reusable sub-components ──────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-md bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-gold" />
      </div>
      <h3 className="font-serif text-base tracking-wide">{label}</h3>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4 bg-muted/30 rounded-lg border border-border space-y-2', className)}>
      {children}
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-primary/8 flex items-center justify-center">
        <Icon className="h-3 w-3 text-primary" />
      </div>
      <div>
        <p className="font-serif-text text-sm font-medium text-foreground leading-snug">{title}</p>
        <p className="font-serif-text text-xs text-muted-foreground mt-0.5 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function Tip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 px-3.5 py-3 bg-gold/5 border border-gold/20 rounded-lg", className)}>
      <span className="text-gold text-sm flex-shrink-0 mt-0.5">✦</span>
      <p className="font-serif-text text-xs text-muted-foreground italic leading-relaxed">{children}</p>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-serif-text text-sm font-medium pr-4">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-border bg-muted/10">
          <p className="font-serif-text text-sm text-muted-foreground leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-serif text-xs flex items-center justify-center mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-serif-text text-sm font-medium leading-snug">{title}</p>
        <p className="font-serif-text text-xs text-muted-foreground mt-0.5 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="font-serif text-sm tracking-wide mb-1">Your Vault is a collaborative memory book.</p>
        <p className="font-serif-text text-xs text-muted-foreground leading-relaxed">
          You invite people to contribute. They add photos, letters, and stories through a
          simple guided flow. You review everything, then order a beautifully printed
          hardcover — or download a PDF — that lasts forever.
        </p>
      </Card>

      <div>
        <SectionHeading icon={BookOpen} label="The lifecycle of a vault" />
        <div className="space-y-3">
          <Step number={1} title="You share a permanent link">
            One link works for everyone. It never expires as long as your vault is open.
          </Step>
          <Step number={2} title="Contributors add their memories">
            Each person follows a guided flow — no training needed. They can add a photo,
            write a letter, or tell a story. You decide how many pages each person can add.
          </Step>
          <Step number={3} title="You review every submission">
            Read each contribution, then approve or reject it. Only approved pages make
            it into the final book.
          </Step>
          <Step number={4} title="Arrange, preview, and order">
            Drag pages into the order you want. Preview the full book layout. Then order
            a printed hardcover or download a PDF.
          </Step>
        </div>
      </div>

      <div>
        <SectionHeading icon={Settings} label="Your role as vault owner" />
        <div className="space-y-2.5">
          <Feature icon={Settings} title="Full control">
            As the owner, you are the only person who can approve pages, change settings,
            invite managers, and place an order.
          </Feature>
          <Feature icon={UserPlus} title="Managers can help">
            You can invite trusted people as managers. They can also review and approve
            pages — useful for large groups or family coordinators.
          </Feature>
        </div>
      </div>
    </div>
  );
}

function SharingTab() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="font-serif text-sm tracking-wide mb-1">One link. Unlimited contributors.</p>
        <p className="font-serif-text text-xs text-muted-foreground leading-relaxed">
          Your vault has a single permanent invite link. Copy it from the
          <strong className="text-foreground"> Share &amp; Invite</strong> button and send it to
          anyone — in a text, email, or group chat. The same link works for everyone.
        </p>
      </Card>

      <div>
        <SectionHeading icon={Share2} label="How the invite link works" />
        <div className="space-y-2.5">
          <Feature icon={Share2} title="Never expires">
            The link stays active as long as your vault exists. You never need to
            generate a new one unless you want to (e.g., if it gets shared too widely).
          </Feature>
          <Feature icon={Users} title="No account required to accept">
            Contributors can sign in or create a free account when they arrive.
            There's no charge to contributors.
          </Feature>
          <Feature icon={Settings} title="Control page limits">
            Under Vault Settings, you can set how many pages each contributor is allowed
            to add (1–4). Default is 1.
          </Feature>
        </div>
      </div>

      <div>
        <SectionHeading icon={UserPlus} label="Adding a manager" />
        <p className="font-serif-text text-xs text-muted-foreground mb-3 leading-relaxed">
          Use the <strong className="text-foreground">Invite Manager</strong> button to
          generate a separate manager link. Managers can review, approve, and reject
          pages — but cannot place orders.
        </p>
        <Tip>
          A good manager is someone who knows the contributors personally — a parent,
          spouse, or close friend who can reach out if contributions aren't coming in.
        </Tip>
      </div>

      <div>
        <SectionHeading icon={BookOpen} label="What contributors experience" />
        <div className="space-y-3">
          <Step number={1} title="They click your link and sign in">
            They create a free account (takes 30 seconds) or sign in if they already have one.
          </Step>
          <Step number={2} title="They see a welcome banner">
            A friendly message explains who the book is for and what they're contributing to.
          </Step>
          <Step number={3} title="They follow a guided 2-step flow">
            First they pick a format (photo + message, letter, or full-page photo).
            Then they write and upload. Guiding prompts help them know what to say.
          </Step>
          <Step number={4} title="Their submission goes to your review queue">
            They see a confirmation, and their page appears in your vault marked as "Draft."
          </Step>
        </div>
      </div>
    </div>
  );
}

function ContributionsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="font-serif text-sm tracking-wide mb-1">Three page formats, unlimited heart.</p>
        <p className="font-serif-text text-xs text-muted-foreground leading-relaxed">
          Every contributor chooses how they want to express themselves. The app guides them
          through their choice — no design skills needed on their end.
        </p>
      </Card>

      <div>
        <SectionHeading icon={Camera} label="Photo + Message" />
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-serif-text text-sm font-medium">One photo alongside a heartfelt reflection</p>
            <p className="font-serif-text text-xs text-muted-foreground mt-1 leading-relaxed">
              The photo fills the left side of a spread; the text sits opposite.
              Ideal for personal memories with a meaningful moment captured.
            </p>
            <p className="font-serif-text text-xs text-muted-foreground mt-1">
              <span className="text-foreground font-medium">Word limit:</span> ~120 words
            </p>
          </div>
        </div>
      </div>

      <div>
        <SectionHeading icon={FileText} label="Letter or Story" />
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-serif-text text-sm font-medium">A full page of beautifully typeset prose</p>
            <p className="font-serif-text text-xs text-muted-foreground mt-1 leading-relaxed">
              Clean two-column layout with optional drop cap. Great for parents, mentors,
              or anyone with a lot to say. No photo required.
            </p>
            <p className="font-serif-text text-xs text-muted-foreground mt-1">
              <span className="text-foreground font-medium">Word limit:</span> ~400 words
            </p>
          </div>
        </div>
      </div>

      <div>
        <SectionHeading icon={Image} label="Full-Page Photo" />
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center">
            <Image className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-serif-text text-sm font-medium">One powerful image with an optional caption</p>
            <p className="font-serif-text text-xs text-muted-foreground mt-1 leading-relaxed">
              The photo fills an entire page — great for milestone shots, group photos,
              or images that need room to breathe.
            </p>
            <p className="font-serif-text text-xs text-muted-foreground mt-1">
              <span className="text-foreground font-medium">Caption:</span> up to 50 characters
            </p>
          </div>
        </div>
      </div>

      <Tip>
        Encourage contributors to use <strong>Photo + Message</strong> for the most
        visually varied book. A mix of all three formats prints beautifully.
      </Tip>
    </div>
  );
}

function ReviewTab() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="font-serif text-sm tracking-wide mb-1">You control what goes in the book.</p>
        <p className="font-serif-text text-xs text-muted-foreground leading-relaxed">
          Every submission starts as a Draft. You read it, then approve it (it enters the book)
          or reject it (it's excluded). You can change your mind anytime before ordering.
        </p>
      </Card>

      <div>
        <SectionHeading icon={ThumbsUp} label="Approving a page" />
        <div className="space-y-2.5">
          <Feature icon={ThumbsUp} title="Click the green checkmark">
            On each page card, tap the green Approve button. The page status changes
            to "Approved" and it will appear in the book.
          </Feature>
          <Feature icon={Eye} title="Only approved pages print">
            The PDF and print order only include approved pages. Drafts and rejected
            pages are invisible in the final output.
          </Feature>
          <Feature icon={ThumbsDown} title="Un-approve at any time">
            Approved pages show an undo button. You can move them back to Draft
            as long as you haven't placed an order yet.
          </Feature>
        </div>
      </div>

      <div>
        <SectionHeading icon={GripVertical} label="Arranging pages" />
        <div className="space-y-2.5">
          <Feature icon={GripVertical} title="Drag to reorder">
            Any page can be dragged to a new position. The title page is always first.
            Use the filter to show only approved pages, then drag them into your preferred order.
          </Feature>
          <Feature icon={Settings} title="Edit a page">
            Click the edit icon on any page card to fix typos, swap a photo, or adjust
            the caption. Changes take effect immediately.
          </Feature>
        </div>
        <Tip className="mt-3">
          A strong book opens with an emotional photo page, builds through letters
          and stories, and closes with a meaningful full-page image.
        </Tip>
      </div>

      <div>
        <SectionHeading icon={Settings} label="Vault settings" />
        <div className="space-y-2.5">
          <Feature icon={Settings} title="Pages per contributor">
            Under Vault Settings, set how many pages each person can add (1–4).
            Raising the limit mid-collection lets contributors add more if you want.
          </Feature>
        </div>
      </div>

      <div>
        <SectionHeading icon={BookOpen} label="The filter bar" />
        <p className="font-serif-text text-xs text-muted-foreground leading-relaxed">
          Use <strong className="text-foreground">All / Approved / Drafts</strong> to quickly
          switch between views. Drafts includes both pages not yet reviewed and any you've
          marked as rejected.
        </p>
      </div>
    </div>
  );
}

function FinishTab() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="font-serif text-sm tracking-wide mb-1">Preview before you commit.</p>
        <p className="font-serif-text text-xs text-muted-foreground leading-relaxed">
          Always open the Book Preview before ordering. It shows exactly how every page
          will look in print — with correct margins, typography, and photo sizing.
        </p>
      </Card>

      <div>
        <SectionHeading icon={Eye} label="Book Preview" />
        <div className="space-y-2.5">
          <Feature icon={Eye} title="Click 'Book Preview'">
            Opens a full screen preview of every approved page in print order.
            The title page is shown first.
          </Feature>
          <Feature icon={BookOpen} title="What you're checking">
            Look for: text that's too long for the template, photos that look blurry
            at full size, or pages you want to reorder.
          </Feature>
        </div>
      </div>

      <div>
        <SectionHeading icon={Download} label="Download PDF" />
        <div className="space-y-2.5">
          <Feature icon={Download} title="Available once you have approved pages">
            The Download PDF button is enabled when at least one page is approved.
            The PDF is 300 DPI, print-ready, with bleed margins.
          </Feature>
          <Feature icon={Settings} title="Optimize images if needed">
            If the PDF looks blurry, use the Optimize Images option in the vault
            to re-compress uploaded photos for best print quality.
          </Feature>
        </div>
        <Tip>
          The PDF download is included free with a printed book order. If you
          only need a digital copy, you can purchase the PDF alone.
        </Tip>
      </div>

      <div>
        <SectionHeading icon={ShoppingCart} label="Order a Printed Book" />
        <div className="space-y-3">
          <Step number={1} title="Click 'Order Book'">
            Choose between a PDF only ($40) or a premium hardcover (from $60 + $1/page).
          </Step>
          <Step number={2} title="Enter shipping details">
            For print orders, enter the delivery address. The book ships via Lulu Direct
            in 5–7 business days.
          </Step>
          <Step number={3} title="Apply your referral code">
            Share your unique referral code with friends after ordering to earn credit
            toward future books.
          </Step>
        </div>
      </div>
    </div>
  );
}

function TipsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="font-serif text-sm tracking-wide mb-1">A great book starts with a great invite.</p>
        <p className="font-serif-text text-xs text-muted-foreground leading-relaxed">
          The quality of contributions depends heavily on how you introduce the project.
          Here's what works.
        </p>
      </Card>

      <div className="space-y-3">
        <Tip>
          <strong className="text-foreground not-italic">Send the link with a personal note.</strong>
          {' '}A message like "I'm putting together a memory book for [Name] — it takes 5 minutes and would mean the world" gets 3× the response rate of a bare link.
        </Tip>
        <Tip>
          <strong className="text-foreground not-italic">Start early.</strong>
          {' '}Send the link 3–4 weeks before the occasion. One follow-up reminder a week before works well.
        </Tip>
        <Tip>
          <strong className="text-foreground not-italic">Be specific in your ask.</strong>
          {' '}Instead of "write something," try "share one memory that shows who [Name] really is."
          Specific prompts unlock better writing.
        </Tip>
        <Tip>
          <strong className="text-foreground not-italic">20–30 contributors is the sweet spot.</strong>
          {' '}Too few and the book feels thin. Too many and it's hard to review before a deadline.
        </Tip>
        <Tip>
          <strong className="text-foreground not-italic">Mix page formats.</strong>
          {' '}Encourage a few people to add full-page photos to break up text-heavy sections.
          Variety makes the book feel like a real publication.
        </Tip>
        <Tip>
          <strong className="text-foreground not-italic">Review as contributions come in.</strong>
          {' '}Don't wait until the deadline to approve. Reviewing daily keeps the queue manageable.
        </Tip>
        <Tip>
          <strong className="text-foreground not-italic">The title page sets the tone.</strong>
          {' '}Fill in the Title Page section with a meaningful cover title and subtitle. It's the first thing the recipient sees.
        </Tip>
      </div>

      <div className="mt-4">
        <SectionHeading icon={HelpCircle} label="Frequently asked questions" />
        <div className="space-y-2">
          <FAQ
            q="Can I add my own page as the owner?"
            a="Yes. Use the 'Add Page' button on the pages section or the Create Page dialog. Owner-created pages are automatically approved."
          />
          <FAQ
            q="What happens if a contributor adds something I don't want?"
            a="Simply click Reject on the page card. The contributor can see it's been rejected and may resubmit, but only you can approve it."
          />
          <FAQ
            q="Can contributors see each other's submissions?"
            a="No. Contributors can only see their own pages. Only owners and managers see all contributions."
          />
          <FAQ
            q="What if I want the same person to add more than one page?"
            a="Raise the 'Pages per contributor' limit in Vault Settings. You can change this at any time, even after contributions have started."
          />
          <FAQ
            q="Can I order more than one copy of the printed book?"
            a="Yes — contact support after placing your first order and we'll arrange additional copies at cost."
          />
          <FAQ
            q="Is there a deadline for ordering?"
            a="No automatic deadline. Your vault stays open indefinitely until you choose to order. Take all the time you need."
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main sheet component ─────────────────────────────────────────────────────

export function OwnerGuideSheet() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const TAB_CONTENT: Record<Tab, React.ReactNode> = {
    overview:      <OverviewTab />,
    sharing:       <SharingTab />,
    contributions: <ContributionsTab />,
    review:        <ReviewTab />,
    finish:        <FinishTab />,
    tips:          <TipsTab />,
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
          How to use your vault
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        {/* Fixed header */}
        <SheetHeader className="px-5 pt-6 pb-4 border-b border-border flex-shrink-0">
          <SheetTitle className="font-serif text-xl tracking-wide flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-gold" />
            Vault Owner Guide
          </SheetTitle>
          <p className="font-serif-text text-xs text-muted-foreground mt-1">
            Everything you need to build a book worth keeping.
          </p>
        </SheetHeader>

        {/* Tab bar */}
        <div className="flex-shrink-0 border-b border-border bg-muted/30 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-3 text-xs font-serif-text tracking-wide border-b-2 transition-all duration-150 whitespace-nowrap',
                    activeTab === tab.id
                      ? 'border-gold text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', activeTab === tab.id ? 'text-gold' : '')} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {TAB_CONTENT[activeTab]}
        </div>
      </SheetContent>
    </Sheet>
  );
}
