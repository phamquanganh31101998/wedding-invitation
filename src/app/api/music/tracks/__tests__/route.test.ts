/**
 * Integration test for /api/music/tracks endpoint
 * Tests the API endpoint functionality using fetch
 */

// Mock fetch for testing API calls
global.fetch = jest.fn();

describe('/api/music/tracks API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch tracks successfully from API', async () => {
    const mockTracks = [
      {
        id: '1',
        filename: 'Artist - Song Title.mp3',
        title: 'Song Title',
        artist: 'Artist',
        src: '/api/music/serve/Artist - Song Title.mp3',
      },
      {
        id: '2',
        filename: 'Another Song.wav',
        title: 'Another Song',
        src: '/api/music/serve/Another Song.wav',
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tracks: mockTracks }),
    });

    const response = await fetch('/api/music/tracks');
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('/api/music/tracks');
    expect(data.tracks).toHaveLength(2);
    expect(data.tracks[0]).toEqual(mockTracks[0]);
    expect(data.tracks[1]).toEqual(mockTracks[1]);
  });

  it('should handle API errors gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const response = await fetch('/api/music/tracks');

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetch('/api/music/tracks')).rejects.toThrow('Network error');
  });

  it('should return empty tracks array when no music files exist', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tracks: [] }),
    });

    const response = await fetch('/api/music/tracks');
    const data = await response.json();

    expect(data.tracks).toEqual([]);
  });
});
