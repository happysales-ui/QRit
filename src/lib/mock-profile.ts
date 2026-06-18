import type { LinkBlock, Profile } from "@/types";

export interface ProfileWithLinks {
  profile: Profile;
  links: LinkBlock[];
}

const DEMO_TIMESTAMP = "2026-06-18T00:00:00.000Z";

const demoProfile: Profile = {
  id: "profile-demo-001",
  username: "demo",
  phone: null,
  display_name: "김지우",
  bio: "디자이너 · 크리에이터 · QRit Jewelry 데모 프로필입니다.",
  avatar_url:
    "https://ui-avatars.com/api/?name=Kim+Jiwoo&background=7c3aed&color=fff&size=256&bold=true",
  theme: "default",
  default_link_id: null,
  expired_at: "2028-06-18T00:00:00.000Z",
  is_admin: false,
  created_at: DEMO_TIMESTAMP,
  updated_at: DEMO_TIMESTAMP,
};

const demoLinks: LinkBlock[] = [
  {
    id: "link-demo-001",
    profile_id: demoProfile.id,
    title: "Instagram",
    url: "https://instagram.com/demo",
    bank_code: null,
    account_no: null,
    sort_order: 0,
    is_active: true,
    created_at: DEMO_TIMESTAMP,
  },
  {
    id: "link-demo-002",
    profile_id: demoProfile.id,
    title: "YouTube",
    url: "https://youtube.com/@demo",
    bank_code: null,
    account_no: null,
    sort_order: 1,
    is_active: true,
    created_at: DEMO_TIMESTAMP,
  },
  {
    id: "link-demo-003",
    profile_id: demoProfile.id,
    title: "내 블로그",
    url: "https://blog.example.com",
    bank_code: null,
    account_no: null,
    sort_order: 2,
    is_active: true,
    created_at: DEMO_TIMESTAMP,
  },
  {
    id: "link-demo-004",
    profile_id: demoProfile.id,
    title: "카카오톡 채널",
    url: "https://pf.kakao.com/_demo",
    bank_code: null,
    account_no: null,
    sort_order: 3,
    is_active: true,
    created_at: DEMO_TIMESTAMP,
  },
  {
    id: "link-demo-005",
    profile_id: demoProfile.id,
    title: "포트폴리오",
    url: "https://portfolio.example.com",
    bank_code: null,
    account_no: null,
    sort_order: 4,
    is_active: true,
    created_at: DEMO_TIMESTAMP,
  },
];

const mockProfiles: Record<string, ProfileWithLinks> = {
  demo: {
    profile: demoProfile,
    links: demoLinks,
  },
};

export function getMockProfileByUsername(
  username: string,
): ProfileWithLinks | null {
  return mockProfiles[username.toLowerCase()] ?? null;
}
