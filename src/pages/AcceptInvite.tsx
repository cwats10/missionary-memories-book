import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getInviteByCode, acceptInvite } from '@/hooks/useInvites';
import { Button } from '@/components/ui/button';
import { brandConfig } from '@/config/brandConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <a href="/" className="font-serif text-xl tracking-tight">
            {brandConfig.name}
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-16">
        <div className="max-w-md mx-auto">
          {error ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="font-serif text-2xl mb-2">Invalid Invite</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => navigate('/')}>Go Home</Button>
              </CardContent>
            </Card>
          ) : success ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="font-serif text-2xl mb-2">You're In!</h2>
                <p className="text-muted-foreground mb-6">
                  You've been added as a {invite?.role === 'coowner' ? 'manager' : 'contributor'} to "{invite?.vaults?.title}".
                </p>
                <Button onClick={() => navigate(`/vault/${invite?.vault_id}`)}>
                  Go to Vault
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-primary/5 rounded-full w-fit mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-2xl">
                  You're Invited!
                </CardTitle>
                <CardDescription>
                  {invite?.role === 'coowner' 
                    ? `You've been invited to be a manager of "${invite?.vaults?.title}"`
                    : "You've been invited to contribute to a memory vault."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invite?.vaults && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <h3 className="font-serif text-lg mb-1">{invite.vaults.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      For {invite.vaults.recipient_name}
                    </p>
                  </div>
                )}

                {!user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Sign in or create an account to accept this invite.
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/auth?redirect=/invite/${code}`)}
                    >
                      Sign In to Accept
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
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
    </div>
  );
};

export default AcceptInvite;
