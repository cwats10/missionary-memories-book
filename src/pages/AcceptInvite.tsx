import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getInviteByCode, acceptInvite } from '@/hooks/useInvites';
import { Button } from '@/components/ui/button';
import { brandConfig } from '@/config/brandConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import GoldDivider from '@/components/decorative/GoldDivider';

const AcceptInvite = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      if (!code) {
        setError('Invalid invite link');
        setLoading(false);
        return;
      }

      const { data, error } = await getInviteByCode(code);
      
      if (error || !data) {
        setError('This invite link is invalid or has expired');
      } else {
        setInvite(data);
      }
      setLoading(false);
    };

    fetchInvite();
  }, [code]);

  const handleAccept = async () => {
    if (!user || !code) return;

    setAccepting(true);
    const { data, error } = await acceptInvite(code, user.id);
    
    if (error) {
      toast.error(error.message);
      setAccepting(false);
      return;
    }

    if (data) {
      // Update invite state with the returned data for success display
      setInvite((prev: any) => ({
        ...prev,
        vault_id: data.vault_id,
        role: data.role,
        vaults: data.vaults || prev?.vaults
      }));
      setSuccess(true);
      const roleLabel = data.role === 'coowner' ? 'manager' : 'contributor';
      toast.success(`You are now a ${roleLabel}!`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        <div className="absolute inset-0 paper-texture pointer-events-none" />
        <LoadingSpinner message="Loading invite..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Paper texture background */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-stone/20 px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <a href="/" className="font-serif text-xl tracking-wide hover:opacity-80 transition-opacity">
            {brandConfig.name}
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-16 relative z-10">
        <div className="max-w-md mx-auto">
          {error ? (
            <Card className="shadow-elegant border-stone/30 overflow-hidden">
              <CardContent className="pt-10 pb-8 text-center">
                <div className="mb-6 relative inline-block">
                  <div className="p-4 bg-destructive/10 rounded-full border border-destructive/20">
                    <XCircle className="h-10 w-10 text-destructive" />
                  </div>
                </div>
                <h2 className="font-serif text-2xl mb-3 tracking-wide">Invalid Invite</h2>
                <p className="font-serif-text text-muted-foreground mb-6">{error}</p>
                <GoldDivider variant="simple" className="mb-6 max-w-[100px] mx-auto" />
                <Button 
                  onClick={() => navigate('/')}
                  className="font-serif transition-all duration-200 hover:scale-[1.02]"
                >
                  Go Home
                </Button>
              </CardContent>
            </Card>
          ) : success ? (
            <Card className="shadow-elegant border-gold/30 overflow-hidden">
              <CardContent className="pt-10 pb-8 text-center">
                <div className="mb-6 relative inline-block">
                  <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  {/* Decorative stars */}
                  <span className="absolute -top-1 -left-1 text-gold/50 text-[10px]">✦</span>
                  <span className="absolute -top-1 -right-1 text-gold/50 text-[10px]">✦</span>
                </div>
                <h2 className="font-serif text-2xl mb-3 tracking-wide">You're In!</h2>
                <p className="font-serif-text text-muted-foreground mb-6">
                  You've been added as a {invite?.role === 'coowner' ? 'manager' : 'contributor'} to "{invite?.vaults?.title}".
                </p>
                <GoldDivider variant="diamond" className="mb-6 max-w-[150px] mx-auto" />
                <Button 
                  onClick={() => navigate(`/vault/${invite?.vault_id}`)}
                  className="font-serif transition-all duration-200 hover:scale-[1.02]"
                >
                  Go to Vault
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-elegant border-stone/30 overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-6 relative">
                  <div className="p-4 bg-gold/10 rounded-full border border-gold/20">
                    <BookOpen className="h-8 w-8 text-gold" />
                  </div>
                  {/* Decorative stars */}
                  <span className="absolute -top-1 -left-1 text-gold/40 text-[10px]">✦</span>
                  <span className="absolute -top-1 -right-1 text-gold/40 text-[10px]">✦</span>
                </div>
                <CardTitle className="font-serif text-2xl tracking-wide">
                  You're Invited!
                </CardTitle>
                <CardDescription className="font-serif-text">
                  {invite?.role === 'coowner' 
                    ? `You've been invited to be a manager of "${invite?.vaults?.title}"`
                    : "You've been invited to contribute to a memory vault."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoldDivider variant="simple" className="mb-6" />
                
                {invite?.vaults && (
                  <div className="bg-background/50 rounded-lg p-5 mb-6 border border-gold/20 shadow-sm">
                    <h3 className="font-serif text-lg mb-1">{invite.vaults.title}</h3>
                    <p className="text-sm font-serif-text text-muted-foreground">
                      For {invite.vaults.recipient_name}
                    </p>
                  </div>
                )}

                {!user ? (
                  <div className="space-y-4">
                    <p className="text-sm font-serif-text text-muted-foreground text-center">
                      Sign in or create an account to accept this invite.
                    </p>
                    <Button 
                      className="w-full font-serif transition-all duration-200 hover:scale-[1.02]" 
                      onClick={() => navigate(`/auth?redirect=/invite/${code}`)}
                    >
                      Sign In to Accept
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full font-serif transition-all duration-200 hover:scale-[1.02]" 
                    onClick={handleAccept}
                    disabled={accepting}
                  >
                    {accepting ? 'Joining...' : 'Accept Invite'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      {/* Footer accent */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </div>
  );
};

export default AcceptInvite;
