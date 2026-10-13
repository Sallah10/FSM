'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Loader2, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { titleCase } from '@/lib/format';
import type { Invite, OrgMember, Organization, UserRole } from '@/lib/types';

const ROLES: UserRole[] = ['admin', 'dispatcher', 'technician'];

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function OrganizationSettings() {
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('dispatcher');
  const [orgName, setOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('technician');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const isAdmin = currentRole === 'admin';

  const load = useCallback(async () => {
    const res = await fetch('/api/org');
    if (!res.ok) {
      setMessage('Could not load your organization.');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setOrganization(data.organization);
    setOrgName(data.organization?.name ?? '');
    setMembers(data.members ?? []);
    setInvites(data.invites ?? []);
    setCurrentRole(data.currentRole ?? 'dispatcher');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function inviteLink(token: string) {
    return `${window.location.origin}/invite/${token}`;
  }

  async function copyLink(token: string) {
    try {
      await navigator.clipboard.writeText(inviteLink(token));
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 1500);
    } catch {
      setMessage('Copy failed — select the link and copy manually.');
    }
  }

  async function saveName() {
    setBusy(true);
    setMessage(null);
    const res = await fetch('/api/org', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orgName }),
    });
    setBusy(false);
    if (!res.ok) {
      setMessage('Could not rename the organization.');
      return;
    }
    setOrganization((prev) => (prev ? { ...prev, name: orgName } : prev));
    setMessage('Organization name updated.');
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch('/api/org/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setMessage(data?.error ?? 'Could not create the invite.');
      return;
    }
    setInviteEmail('');
    setMessage('Invite ready — copy the link and send it to them.');
    if (data?.invite) {
      setInvites((prev) => [
        data.invite,
        ...prev.filter((invite: Invite) => invite.id !== data.invite.id),
      ]);
    }
  }

  async function changeRole(id: string, role: UserRole) {
    setMessage(null);
    const res = await fetch(`/api/org/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? 'Could not change the role.');
      return;
    }
    setMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, role } : member)),
    );
  }

  async function removeMember(id: string) {
    setMessage(null);
    const res = await fetch(`/api/org/members/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? 'Could not remove the member.');
      return;
    }
    setMembers((prev) => prev.filter((member) => member.id !== id));
  }

  async function revokeInvite(id: string) {
    setMessage(null);
    const res = await fetch(`/api/org/invites/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setMessage('Could not revoke the invite.');
      return;
    }
    setInvites((prev) => prev.filter((invite) => invite.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading organization…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {message ? (
        <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Label htmlFor="org-name">Organization name</Label>
        <div className="flex items-center gap-2">
          <Input
            id="org-name"
            value={orgName}
            disabled={!isAdmin || busy}
            onChange={(event) => setOrgName(event.target.value)}
          />
          {isAdmin ? (
            <Button
              variant="outline"
              onClick={saveName}
              disabled={busy || orgName.trim().length < 2 || orgName === organization?.name}
            >
              Save
            </Button>
          ) : null}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Members</p>
          <span className="text-xs text-muted-foreground">
            {members.length} {members.length === 1 ? 'person' : 'people'}
          </span>
        </div>
        <div className="flex flex-col">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 border-b py-3 last:border-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground">
                  {initialsOf(member.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      changeRole(member.id, value as UserRole)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {titleCase(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Remove ${member.name}`}
                    onClick={() => removeMember(member.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {titleCase(member.role)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium">Invite people</p>
        {isAdmin ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@company.com"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as UserRole)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {titleCase(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={sendInvite} disabled={busy || !inviteEmail.trim()}>
              <UserPlus /> Invite
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Only admins can invite people.
          </p>
        )}

        {invites.length > 0 ? (
          <div className="flex flex-col">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-4 border-b py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {titleCase(invite.role)} · pending
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(invite.token)}
                  >
                    {copiedToken === invite.token ? <Check /> : <Copy />}
                    {copiedToken === invite.token ? 'Copied' : 'Copy link'}
                  </Button>
                  {isAdmin ? (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Revoke invite"
                      onClick={() => revokeInvite(invite.id)}
                    >
                      <Trash2 />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pending invites.</p>
        )}
      </div>
    </div>
  );
}
