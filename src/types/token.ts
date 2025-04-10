export interface Token {
  name: string;
  id: string;
  email: string;
  githubId: string | null;
  githubImageUrl: string | null;
  exp: number;
}
