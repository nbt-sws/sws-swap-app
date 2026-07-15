-- 002_seed_cards.sql
-- Seed card catalog (One Piece + Yu-Gi-Oh cards)
-- Run in public schema

INSERT INTO public.cards (code, name_en, name_jp, rarity, type, language, game, condition, image_url) VALUES
-- One Piece cards
('OP01-001', 'Roronoa Zoro', 'ロロノア・ゾロ', 'L', 'Leader', 'JP', 'one-piece', 'Raw', NULL),
('OP01-025', 'Nami (Alt Art)', 'ナミ（パラレル）', 'SR', 'Character', 'JP', 'one-piece', 'Raw', NULL),
('OP01-120', 'Shanks (Alt)', 'シャンクス（パラレル）', 'SR', 'Character', 'JP', 'one-piece', 'Raw', NULL),
('OP02-013', 'Portgas D. Ace', 'ポートガス・D・エース', 'SR', 'Character', 'JP', 'one-piece', 'Raw', NULL),
('OP03-070', 'Charlotte Katakuri', 'シャーロット・カタクリ', 'SR', 'Character', 'JP', 'one-piece', 'Raw', NULL),
('OP05-060', 'Monkey D. Luffy G5', 'モンキー・D・ルフィ ギア5', 'SEC', 'Character', 'JP', 'one-piece', 'Raw', NULL),
('OP-05 BOX', 'Awakening Booster Box', '覚醒の鼓動', 'BOX', 'Sealed', 'JP', 'one-piece', 'Raw', NULL),
('OP06-001', 'Kaido', 'カイドウ', 'L', 'Leader', 'JP', 'one-piece', 'Raw', NULL),
('OP07-019', 'Trafalgar Law', 'トラファルガー・ロー', 'SR', 'Character', 'JP', 'one-piece', 'Raw', NULL),
('OP08-001', 'Marshall D. Teach', 'マーシャル・D・ティーチ', 'L', 'Leader', 'JP', 'one-piece', 'Raw', NULL),

-- Yu-Gi-Oh cards
('QCAC-JP001', 'Blue-Eyes White Dragon', '青眼の白龍', 'QCSR', 'Monster', 'JP', 'yu-gi-oh', 'Raw', NULL),
('RD/KP16-JP000', 'Winged Kuriboh', 'ハネクリボー', 'UR', 'Monster', 'JP', 'yu-gi-oh', 'Raw', NULL),
('PAC1-JP001', 'Dark Magician', 'ブラック・マジシャン', 'UR', 'Monster', 'JP', 'yu-gi-oh', 'Raw', NULL),
('PAC1-JP002', 'Red-Eyes Black Dragon', '真紅眼の黒竜', 'UR', 'Monster', 'JP', 'yu-gi-oh', 'Raw', NULL),
('RC04-JP001', 'Ash Blossom & Joyous Spring', '灰流うらら', 'SR', 'Monster', 'JP', 'yu-gi-oh', 'Raw', NULL)

ON CONFLICT (code) DO NOTHING;
