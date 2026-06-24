"use client";

import ProfileForm from "./profile-form";
import RepositoryList from "./repository-list";

export default function SettingsUI() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and connected repositories.
        </p>
      </div>
      <ProfileForm />
      <RepositoryList />
    </div>
  );
}
