import type { ConnectionFormState } from "@/lib/admin-api";

export function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-[#4d4332]">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-[#e4cca0] bg-white px-4 text-sm text-[#2f2a21] shadow-sm outline-none transition focus:border-[#cf9a39] focus:ring-2 focus:ring-[#f2d491]"
      />
    </label>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-[#ead9b8] bg-[#fff8e7] px-4 py-3 text-sm font-medium text-[#4d4332]">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-[#c99636]" : "bg-[#dbc8a0]"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}

export function ConnectionFields({
  title,
  value,
  onChange,
  requirePassword,
}: {
  title: string;
  value: ConnectionFormState;
  onChange: (value: ConnectionFormState) => void;
  requirePassword: boolean;
}) {
  const update = (key: keyof ConnectionFormState, nextValue: string | boolean) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <div className="space-y-4 rounded-[28px] border border-[#ecd7af] bg-[#fffaf0] p-5 shadow-[0_20px_45px_rgba(175,132,35,0.08)]">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a07a2d]">
          {title}
        </h3>
        <p className="mt-1 text-sm text-[#7b6a48]">
          Save the MSSQL access details that should be synced into MongoDB.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Connection label"
          value={value.label}
          onChange={(next) => update("label", next)}
          placeholder="Main outlet"
        />
        <InputField
          label="Database name"
          value={value.database}
          onChange={(next) => update("database", next)}
          placeholder="sharpos_live"
          required
        />
        <InputField
          label="Host"
          value={value.host}
          onChange={(next) => update("host", next)}
          placeholder="127.0.0.1"
          required
        />
        <InputField
          label="Port"
          value={value.port}
          onChange={(next) => update("port", next)}
          placeholder="1433"
          required
        />
        <InputField
          label="Username"
          value={value.username}
          onChange={(next) => update("username", next)}
          placeholder="sa"
          required
        />
        <InputField
          label={requirePassword ? "Password" : "Password (leave blank to keep current)"}
          value={value.password}
          onChange={(next) => update("password", next)}
          type="password"
          required={requirePassword}
        />
      </div>
      <ToggleField
        label="Use encrypted SQL connection"
        checked={value.encrypt}
        onChange={(next) => update("encrypt", next)}
      />
    </div>
  );
}
