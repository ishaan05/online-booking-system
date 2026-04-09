/** Rotated by venueId when API has no PhotoImage — varied hall / event imagery */
export const HALL_PLACEHOLDER_IMAGES: readonly string[] = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1540575467063-802a961fd24b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511578314325-372018f604b5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1530026405187-edc674f2d617?auto=format&fit=crop&w=900&q=80',
];

export function hallPlaceholderImage(venueId: number): string {
  const i = Math.abs(venueId) % HALL_PLACEHOLDER_IMAGES.length;
  return HALL_PLACEHOLDER_IMAGES[i]!;
}
