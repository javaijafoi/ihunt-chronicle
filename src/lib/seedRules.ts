import { doc, setDoc, serverTimestamp, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SKILLS } from '@/data/skills';
import { SKILL_MANEUVERS } from '@/data/skillManeuvers';
import { BOOK_GIFTS } from '@/data/gifts';
import { DRIVES } from '@/data/drives';
import type { DriveName } from '@/types/rules';

// Helper to create URL-friendly slug
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export interface SeedProgress {
  current: number;
  total: number;
  stage: 'skills' | 'maneuvers' | 'gifts' | 'drives' | 'done';
  message: string;
}

export async function seedDatabase(
  onProgress?: (progress: SeedProgress) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    const skillEntries = Object.entries(SKILLS);
    const maneuverEntries = Object.entries(SKILL_MANEUVERS);
    const driveManeuverCount = DRIVES.reduce((acc, d) =>
      acc + 1 + (d.exclusiveManeuvers?.length || 0), 0);

    const totalItems =
      skillEntries.length +
      maneuverEntries.reduce((acc, [, m]) => acc + m.length, 0) +
      driveManeuverCount +
      BOOK_GIFTS.length +
      DRIVES.length;

    let current = 0;

    // 1. Seed Skills
    onProgress?.({ current, total: totalItems, stage: 'skills', message: 'Importando perícias...' });

    for (const [name, skill] of skillEntries) {
      const slug = toSlug(name);
      await setDoc(doc(db, 'system_skills', slug), {
        id: slug,
        name: skill.name,
        description: skill.description || '',
        actions: skill.actions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      current++;
      onProgress?.({ current, total: totalItems, stage: 'skills', message: `Perícia: ${skill.name}` });
    }

    // 2. Seed Skill Maneuvers
    onProgress?.({ current, total: totalItems, stage: 'maneuvers', message: 'Importando manobras de perícias...' });

    for (const [skillName, maneuvers] of maneuverEntries) {
      const skillSlug = toSlug(skillName);
      for (const maneuver of maneuvers) {
        await setDoc(doc(db, 'system_maneuvers', maneuver.id), {
          id: maneuver.id,
          name: maneuver.name,
          description: maneuver.description,
          skillId: skillSlug,
          type: 'skill',
          cost: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        current++;
        onProgress?.({ current, total: totalItems, stage: 'maneuvers', message: `Manobra: ${maneuver.name}` });
      }
    }

    // 3. Seed Drive Maneuvers and Drives
    onProgress?.({ current, total: totalItems, stage: 'drives', message: 'Importando taras e suas manobras...' });

    for (const drive of DRIVES) {
      const freeManeuverIds: string[] = [];
      const exclusiveManeuverIds: string[] = [];

      // Free maneuver
      if (drive.freeManeuver) {
        const freeId = drive.freeManeuver.id;
        freeManeuverIds.push(freeId);

        await setDoc(doc(db, 'system_maneuvers', freeId), {
          id: freeId,
          name: drive.freeManeuver.name,
          description: drive.freeManeuver.description,
          driveId: drive.id as DriveName,
          type: 'drive_free',
          cost: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        current++;
        onProgress?.({ current, total: totalItems, stage: 'drives', message: `Manobra grátis: ${drive.freeManeuver.name}` });
      }

      // Exclusive maneuvers
      for (const maneuver of drive.exclusiveManeuvers || []) {
        exclusiveManeuverIds.push(maneuver.id);

        await setDoc(doc(db, 'system_maneuvers', maneuver.id), {
          id: maneuver.id,
          name: maneuver.name,
          description: maneuver.description,
          driveId: drive.id as DriveName,
          type: 'drive_exclusive',
          cost: maneuver.cost || 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        current++;
        onProgress?.({ current, total: totalItems, stage: 'drives', message: `Manobra exclusiva: ${maneuver.name}` });
      }

      // Save drive
      await setDoc(doc(db, 'system_drives', drive.id), {
        id: drive.id,
        name: drive.name,
        icon: drive.icon,
        summary: drive.summary,
        freeManeuverIds,
        exclusiveManeuverIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      current++;
      onProgress?.({ current, total: totalItems, stage: 'drives', message: `Tara: ${drive.name}` });
    }

    // 4. Seed Gifts
    onProgress?.({ current, total: totalItems, stage: 'gifts', message: 'Importando dons...' });

    for (const gift of BOOK_GIFTS) {
      await setDoc(doc(db, 'system_gifts', gift.id), {
        id: gift.id,
        name: gift.name,
        description: gift.description,
        essenceCost: gift.essenceCost,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      current++;
      onProgress?.({ current, total: totalItems, stage: 'gifts', message: `Dom: ${gift.name}` });
    }

    onProgress?.({ current: totalItems, total: totalItems, stage: 'done', message: 'Importação concluída!' });

    return { success: true };
  } catch (err) {
    console.error('[seedDatabase] Error:', err);
    return { success: false, error: (err as Error).message };
  }
}

export async function clearAllRules(): Promise<{ success: boolean; error?: string }> {
  try {
    const collections = ['system_skills', 'system_maneuvers', 'system_gifts', 'system_drives'];

    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);

      snapshot.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
    }

    return { success: true };
  } catch (err) {
    console.error('[clearAllRules] Error:', err);
    return { success: false, error: (err as Error).message };
  }
}

export async function exportRules(): Promise<void> {
  try {
    const data = {
      skills: (await getDocs(collection(db, 'system_skills'))).docs.map(d => d.data()),
      maneuvers: (await getDocs(collection(db, 'system_maneuvers'))).docs.map(d => d.data()),
      gifts: (await getDocs(collection(db, 'system_gifts'))).docs.map(d => d.data()),
      drives: (await getDocs(collection(db, 'system_drives'))).docs.map(d => d.data()),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ihunt-rules-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('[exportRules] Error:', err);
    throw err;
  }
}
