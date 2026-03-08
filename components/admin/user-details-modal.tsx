"use client";

import { FormEvent, useState } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ConnectionFields } from "@/components/admin/form-fields";
import {
  connectionFormFromConnection,
  emptyConnectionForm,
  formatDateTime,
  type ConnectionFormState,
  type ManagedUser,
} from "@/lib/admin-api";

export function UserDetailsModal({
  user,
  busyKey,
  onClose,
  onSaveConnection,
  onAddConnection,
  onDeleteConnection,
  onDeleteUser,
}: {
  user: ManagedUser;
  busyKey: string | null;
  onClose: () => void;
  onSaveConnection: (
    userId: string,
    connectionId: string,
    payload: ConnectionFormState
  ) => Promise<void>;
  onAddConnection: (userId: string, payload: ConnectionFormState) => Promise<void>;
  onDeleteConnection: (userId: string, connectionId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}) {
  const [connectionForms, setConnectionForms] = useState<Record<string, ConnectionFormState>>(
    () =>
      Object.fromEntries(
        user.connections.map((connection) => [
          connection.id,
          connectionFormFromConnection(connection),
        ])
      )
  );
  const [createConnectionOpen, setCreateConnectionOpen] = useState(
    user.connections.length === 0
  );
  const [newConnectionForm, setNewConnectionForm] = useState<ConnectionFormState>(
    () => emptyConnectionForm()
  );
  const [confirmation, setConfirmation] = useState<
    | null
    | {
        type: "delete-user" | "delete-connection";
        connectionId?: string;
        title: string;
        description: string;
        confirmLabel: string;
      }
  >(null);
  const isCreatingConnection = busyKey === `add-connection:${user.id}`;
  const isDeletingUser = busyKey === `delete-user:${user.id}`;
  const isDeletingConnection = confirmation?.connectionId
    ? busyKey === `delete-connection:${confirmation.connectionId}`
    : false;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
        <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-[#e5d5b3] bg-white shadow-[0_28px_70px_rgba(0,0,0,0.18)]">
          <div className="flex items-start justify-between gap-4 border-b border-[#efdfbc] bg-[#fffaf0] px-6 py-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a07a2d]">
                User details
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-[#2f2a21]">{user.name}</h2>
              <p className="mt-1 text-sm text-[#7b6a48]">{user.email}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateConnectionOpen((current) => !current)}
                className="rounded-full border border-[#dfc58d] bg-[#fff8e7] px-4 py-2 text-sm font-semibold text-[#6d5526]"
              >
                {createConnectionOpen ? "Hide add database" : "Add database"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfirmation({
                    type: "delete-user",
                    title: `Delete ${user.name}?`,
                    description:
                      "This removes the user, every saved database connection, and all synced report data tied to that user.",
                    confirmLabel: "Delete user",
                  })
                }
                disabled={isDeletingUser}
                className="rounded-full border border-[#e1a0a0] bg-[#fff1f1] px-4 py-2 text-sm font-semibold text-[#9f2b2b] disabled:opacity-60"
              >
                {isDeletingUser ? "Deleting..." : "Delete user"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#dfc58d] bg-[#fff8e7] px-4 py-2 text-sm font-semibold text-[#6d5526]"
              >
                Close
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-6">
            <div className="grid gap-3 sm:grid-cols-4">
              <MetaCard label="Role" value={user.role} />
              <MetaCard label="Databases" value={String(user.totalConnections)} />
              <MetaCard label="Created" value={formatDateTime(user.createdAt)} />
              <MetaCard label="Updated" value={formatDateTime(user.updatedAt)} />
            </div>

            <div className="mt-6 space-y-5">
              {createConnectionOpen ? (
                <form
                  className="space-y-4 rounded-[24px] border border-[#ecd9b3] bg-[#fffaf0] p-5"
                  onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    await onAddConnection(user.id, newConnectionForm);
                  }}
                >
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a07a2d]">
                        Add database
                      </div>
                      <p className="mt-2 text-sm text-[#7b6a48]">
                        A user can have multiple database connections. Add another one here.
                      </p>
                    </div>
                  </div>

                  <ConnectionFields
                    title="New connection"
                    value={newConnectionForm}
                    onChange={setNewConnectionForm}
                    requirePassword
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateConnectionOpen(false);
                        setNewConnectionForm(emptyConnectionForm());
                      }}
                      className="rounded-full border border-[#dfc58d] bg-[#fff8e7] px-5 py-2.5 text-sm font-semibold text-[#6d5526]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingConnection}
                      className="rounded-full bg-[#2f2a21] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#443827] disabled:opacity-60"
                    >
                      {isCreatingConnection ? "Saving..." : "Add database"}
                    </button>
                  </div>
                </form>
              ) : null}

              {!user.connections.length ? (
                <div className="rounded-[24px] border border-dashed border-[#dfc58d] bg-[#fffaf0] px-5 py-6 text-sm text-[#7b6a48]">
                  No database connection has been saved for this user yet.
                </div>
              ) : null}

              {user.connections.map((connection) => {
                const form =
                  connectionForms[connection.id] || connectionFormFromConnection(connection);
                const isSaving = busyKey === `connection:${connection.id}`;
                const isDeleting = busyKey === `delete-connection:${connection.id}`;

                return (
                  <form
                    key={connection.id}
                    className="space-y-4 rounded-[24px] border border-[#ecd9b3] bg-[#fffcf7] p-5"
                    onSubmit={async (event: FormEvent<HTMLFormElement>) => {
                      event.preventDefault();
                      await onSaveConnection(user.id, connection.id, form);
                    }}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="inline-flex items-center rounded-full border border-[#ead29d] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9f7322]">
                          {connection.label || connection.database}
                        </div>
                        <p className="mt-3 text-sm text-[#7b6a48]">
                          Last sync: {formatDateTime(connection.lastSyncAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmation({
                            type: "delete-connection",
                            connectionId: connection.id,
                            title: `Delete ${connection.label || connection.database}?`,
                            description:
                              "This removes the selected database connection and all synced report data tied to it.",
                            confirmLabel: "Delete database",
                          })
                        }
                        disabled={isDeleting}
                        className="rounded-full border border-[#e1a0a0] bg-[#fff1f1] px-4 py-2 text-sm font-semibold text-[#9f2b2b] disabled:opacity-60"
                      >
                        {isDeleting ? "Deleting..." : "Delete database"}
                      </button>
                    </div>

                    <ConnectionFields
                      title="Connection details"
                      value={form}
                      onChange={(next) =>
                        setConnectionForms((current) => ({
                          ...current,
                          [connection.id]: next,
                        }))
                      }
                      requirePassword={false}
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving || isDeleting}
                        className="rounded-full bg-[#2f2a21] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#443827] disabled:opacity-60"
                      >
                        {isSaving ? "Saving..." : "Save connection"}
                      </button>
                    </div>
                  </form>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(confirmation)}
        title={confirmation?.title || ""}
        description={confirmation?.description || ""}
        confirmLabel={confirmation?.confirmLabel || "Confirm"}
        busy={isDeletingUser || isDeletingConnection}
        onClose={() => setConfirmation(null)}
        onConfirm={async () => {
          if (!confirmation) return;

          if (confirmation.type === "delete-user") {
            await onDeleteUser(user.id);
          } else if (confirmation.connectionId) {
            await onDeleteConnection(user.id, confirmation.connectionId);
          }

          setConfirmation(null);
        }}
      />
    </>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#efdfbc] bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-[0.16em] text-[#a48548]">{label}</div>
      <div className="mt-2 text-sm font-semibold text-[#2f2a21]">{value}</div>
    </div>
  );
}
