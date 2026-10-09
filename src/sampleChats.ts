export interface SampleChat {
  id: string;
  title: string;
  icon: string;
  badge: string;
  description: string;
  content: string;
}

export const SAMPLE_CHATS: SampleChat[] = [
  {
    id: 'prod-incident',
    title: 'Prod Outage: Database Replica Lag & Payment Gateway',
    icon: '🔥',
    badge: 'Critical Incident',
    description: 'High-urgency Slack incident room with immediate rollback, database failover, and assigned postmortem.',
    content: `[14:02:11] @alex (SRE): 🚨 Alert triggered: p99 latency on payments-service exceeded 4,500ms. Error rate at 18.4%.
[14:03:05] @marcus (Incident Lead): Acknowledged. Opening incident room #inc-2024-0412. Who is on-call for DB?
[14:03:22] @sarah (DB Admin): I'm here. Checking replica lag now... Postgres replica-3 is 45 minutes behind due to a locked transaction on table \`orders_v2\`.
[14:04:10] @alex (SRE): Traffic is piling up at the Stripe checkout webhook. We need to shed load or kill the locking query immediately.
[14:05:00] @marcus (Incident Lead): @sarah go ahead and terminate the locking backend query immediately.
[14:05:45] @sarah (DB Admin): Terminated PID 44102. Replica catch-up in progress, down to 8 minutes lag.
[14:07:15] @chen (Backend Lead): The query was from the batch billing cron deployed 30 mins ago in v2.4.1. We should roll back the billing service to v2.4.0.
[14:08:00] @marcus (Incident Lead): Approved. Decision: Roll back payments-service and billing-service to v2.4.0 now.
[14:08:40] @chen (Backend Lead): Initiating rollback. Target completion in 10 minutes.
[14:18:20] @chen (Backend Lead): Rollback to v2.4.0 completed. P99 latency back down to 120ms. Error rate normalized to 0.02%.
[14:19:00] @marcus (Incident Lead): Incident mitigated. All services green.
[14:20:15] @marcus (Incident Lead): Action items before closing:
- @sarah: Add automated lock timeout alerts to PostgreSQL by end of day today (5:00 PM).
- @chen: Audit the batch billing migration script and present fix by tomorrow 11:00 AM.
- @alex: Draft incident post-mortem document and share with leadership by Friday 3:00 PM.
[14:21:00] @sarah: On it.
[14:21:12] @chen: Will do.
[14:21:30] @alex: Will prepare the draft postmortem.`,
  },
  {
    id: 'q4-launch',
    title: 'Q4 Product Launch: Feature Cutoff & Marketing Sync',
    icon: '🚀',
    badge: 'Launch Planning',
    description: 'Medium-urgency cross-functional release decisions, scope cutoffs, and QA timelines.',
    content: `[09:30:15] @priya (Product Manager): Morning everyone! We have 72 hours before the Q4 Release candidate freeze. Let's run through remaining blockers.
[09:31:02] @david (Tech Lead): The Dark Mode theme is 100% complete and verified. But Enterprise SSO via Okta still has 2 open edge-case bug tickets.
[09:32:10] @maya (QA Lead): Yes, SSO fails when users have multi-domain federated emails. It will take another 2 full days of testing if we patch it today.
[09:33:45] @priya (Product Manager): Decision: Let's cut Okta SSO from this release and postpone it to v4.2. We cannot risk the main release date. Dark Mode and Workspace Sharing will ship.
[09:34:20] @david (Tech Lead): Agreed, that is much safer.
[09:35:00] @tom (Marketing): Sounds good. What about marketing collaterals and release notes?
[09:35:45] @priya (Product Manager): Here are the action items:
- @david: Disable SSO feature flag in production build branch by today 4:00 PM.
- @maya: Run final regression test suite on Dark Mode and Workspace Sharing by tomorrow 12:00 PM.
- @tom: Update product changelog and blog post to remove SSO mentions by Thursday 2:00 PM.
- @priya: Schedule customer advisory board demo for next Tuesday.
[09:37:10] @tom: Perfect, I will adjust the launch campaign graphics accordingly.
[09:38:00] @maya: QA regression kickoff scheduled for 1:00 PM today.`,
  },
  {
    id: 'design-ux',
    title: 'Mobile Navigation Overhaul & Design Critique',
    icon: '💬',
    badge: 'Design Async',
    description: 'Low-urgency asynchronous feedback thread with design choices and prototype handoff.',
    content: `[16:00:20] @elena (Lead Designer): Hey team, I just posted the revised Figma prototypes for the mobile navigation tab bar in #design-reviews.
[16:02:15] @jordan (Mobile Dev): Looking at Option B vs Option C. Option B (bottom navigation with floating action button) is much cleaner for one-handed thumb reach.
[16:04:30] @nina (UX Researcher): The user test recordings from last week also confirmed this. 8 out of 10 users struggled to reach top burger menus on larger iOS devices.
[16:06:00] @elena (Lead Designer): Great, consensus seems to be Option B. Decision: We are moving forward with Option B (Bottom Tab Bar with 4 primary destinations).
[16:07:15] @elena (Lead Designer): Next steps:
- @elena: Export design tokens, icon SVGs, and updated Figma component spec by Friday 5:00 PM.
- @jordan: Build SwiftUI and Jetpack Compose scaffold for the tab navigation by next Wednesday.
- @nina: Prepare benchmark survey for the beta cohort launch.
[16:08:45] @jordan: Sounds good, will plan the mobile sprint accordingly!`,
  },
  {
    id: 'standup-blockers',
    title: 'Sprint 42 Standup: AI Integration & API Rate Limits',
    icon: '⚡',
    badge: 'Engineering Standup',
    description: 'Team standup discussing API token limits, caching strategies, and dependency unlocks.',
    content: `[10:00:10] @sam (Frontend): Yesterday: Hooked up WebGPU pipeline. Today: Working on JSON schema validation in the browser. Blocker: Need updated types from backend.
[10:01:25] @rachel (Backend): @sam I just merged the TypeScript types PR #342 into main. You should be unblocked now!
[10:02:00] @kavita (Eng Manager): What is our plan for local model weights caching? If users reload the page, do they re-download 300MB?
[10:03:15] @sam (Frontend): No, WebLLM uses Cache API and IndexedDB under the hood. First load downloads weights, subsequent loads take ~0.8s from disk cache.
[10:04:10] @kavita (Eng Manager): Excellent. Decision: Keep browser cache enabled with IndexedDB fallback and show user cache status in the UI.
[10:05:00] @kavita (Eng Manager): Assignments:
- @sam: Integrate cache indicator and model download progress bar by today 6:00 PM.
- @rachel: Deploy staging API with CORS headers by tomorrow 10:00 AM.
- @sam: Tag @kavita for end-to-end testing once staging is ready.`,
  }
];
