export interface AlertPostDto {
  authorization: string;
  status: string;
  summary: string;
  times?: { startsAt: string; endsAt: string };
}
