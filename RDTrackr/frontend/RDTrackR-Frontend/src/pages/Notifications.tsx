import { Bell, Check, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, reload } = useNotifications();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma notificação encontrada.
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between border p-4 rounded-lg transition hover:bg-muted/40 ${
                    !n.isRead ? "border-primary/50" : "border-muted"
                  }`}
                >
                  <div className="flex flex-col">
                    <p
                      className={`text-sm ${
                        n.isRead ? "text-muted-foreground" : ""
                      }`}
                    >
                      {n.message}
                    </p>

                    <span className="text-xs text-muted-foreground mt-1">
                      {format(n.createdAt, "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(n.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Marcar como lida
                    </Button>
                  )}

                  {n.isRead && <Badge variant="secondary">Lida</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={reload} variant="outline">
          Recarregar
        </Button>
      </div>
    </div>
  );
}
