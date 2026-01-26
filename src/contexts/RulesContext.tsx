import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SystemSkill, SystemManeuver, SystemGift, SystemDrive, ResolvedDrive, DriveName } from '@/types/rules';

// Fallback imports for when Firestore is empty
import { SKILLS, SKILL_NAMES } from '@/data/skills';
import { SKILL_MANEUVERS } from '@/data/skillManeuvers';
import { BOOK_GIFTS } from '@/data/gifts';
import { DRIVES } from '@/data/drives';

interface RulesContextValue {
  // Data
  skills: SystemSkill[];
  skillNames: string[];
  skillManeuvers: Record<string, SystemManeuver[]>;
  drives: ResolvedDrive[];
  gifts: SystemGift[];
  generalManeuvers: SystemManeuver[];
  allManeuvers: SystemManeuver[];

  // State
  isLoading: boolean;
  error: Error | null;

  // Helpers
  getDriveById: (id: DriveName) => ResolvedDrive | undefined;
  getSkillManeuvers: (skillId: string) => SystemManeuver[];
  findGift: (id: string) => SystemGift | undefined;
  findManeuver: (id: string) => SystemManeuver | undefined;
  getAllManeuversForDrive: (driveId: DriveName) => SystemManeuver[];

  // Refresh
  refetch: () => Promise<void>;
}

const RulesContext = createContext<RulesContextValue | null>(null);

// Convert static data to SystemSkill format
function convertStaticSkills(): SystemSkill[] {
  return Object.entries(SKILLS).map(([id, skill]) => ({
    id: id.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_'),
    name: skill.name,
    actions: skill.actions,
  }));
}

// Convert static maneuvers to SystemManeuver format
function convertStaticManeuvers(): SystemManeuver[] {
  const maneuvers: SystemManeuver[] = [];

  // Skill maneuvers
  for (const [skillId, skillManeuvers] of Object.entries(SKILL_MANEUVERS)) {
    for (const m of skillManeuvers) {
      maneuvers.push({
        id: m.id,
        name: m.name,
        description: m.description,
        skillId: m.skillId,
        type: 'skill',
        cost: 1,
      });
    }
  }

  // Drive maneuvers
  for (const drive of DRIVES) {
    // Free maneuver
    if (drive.freeManeuver) {
      maneuvers.push({
        id: drive.freeManeuver.id,
        name: drive.freeManeuver.name,
        description: drive.freeManeuver.description,
        driveId: drive.id,
        type: 'drive_free',
        cost: 0,
      });
    }

    // Exclusive maneuvers
    for (const m of drive.exclusiveManeuvers || []) {
      maneuvers.push({
        id: m.id,
        name: m.name,
        description: m.description,
        driveId: drive.id,
        type: 'drive_exclusive',
        cost: m.cost || 1,
      });
    }
  }

  return maneuvers;
}

// Convert static gifts to SystemGift format
function convertStaticGifts(): SystemGift[] {
  return BOOK_GIFTS.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    essenceCost: g.essenceCost,
  }));
}

// Convert static drives to SystemDrive format
function convertStaticDrives(): SystemDrive[] {
  return DRIVES.map(d => ({
    id: d.id,
    name: d.name,
    icon: d.icon,
    summary: d.summary,
    freeManeuverIds: d.freeManeuver ? [d.freeManeuver.id] : [],
    exclusiveManeuverIds: (d.exclusiveManeuvers || []).map(m => m.id),
  }));
}

export function RulesProvider({ children }: { children: React.ReactNode }) {
  const [skills, setSkills] = useState<SystemSkill[]>([]);
  const [maneuvers, setManeuvers] = useState<SystemManeuver[]>([]);
  const [gifts, setGifts] = useState<SystemGift[]>([]);
  const [drives, setDrives] = useState<SystemDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all collections in parallel
      const [skillsSnap, maneuversSnap, giftsSnap, drivesSnap] = await Promise.all([
        getDocs(query(collection(db, 'system_skills'), orderBy('name'))),
        getDocs(collection(db, 'system_maneuvers')),
        getDocs(query(collection(db, 'system_gifts'), orderBy('name'))),
        getDocs(collection(db, 'system_drives')),
      ]);

      const fetchedSkills = skillsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.Name || doc.id, // Fallback to ID if name missing
          actions: data.actions || [],
          // Normalize ID for consistency
          ...data
        } as SystemSkill;
      });

      const fetchedManeuvers = maneuversSnap.docs.map(doc => {
        const data = doc.data();
        // Infer type if missing
        let type = data.type;
        if (!type) {
          if (data.skillId) type = 'skill';
          else if (data.driveId) type = 'drive_exclusive'; // approximation
          else type = 'general';
        }

        return {
          id: doc.id,
          name: data.name || data.Name || 'Unknown Maneuver',
          description: data.description || data.Description || '',
          skillId: data.skillId || data.SkillId,
          driveId: data.driveId || data.DriveId,
          type: type as any,
          cost: data.cost ?? 1,
          ...data
        } as SystemManeuver;
      });

      const fetchedGifts = giftsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.Name || 'Unknown Gift',
          description: data.description || data.Description || '',
          essenceCost: data.essenceCost ?? data.cost ?? 1,
          ...data
        } as SystemGift;
      });

      const fetchedDrives = drivesSnap.docs.map(doc => {
        const data = doc.data();
        // Handle legacy freeManeuver (single object) vs freeManeuverIds (array)
        let freeIds = data.freeManeuverIds || [];
        if (!freeIds.length && data.freeManeuver && data.freeManeuver.id) {
          freeIds = [data.freeManeuver.id];
        }

        let exclusiveIds = data.exclusiveManeuverIds || [];
        if (!exclusiveIds.length && data.exclusiveManeuvers) {
          exclusiveIds = data.exclusiveManeuvers.map((m: any) => m.id);
        }

        return {
          id: doc.id,
          name: data.name || data.Name || doc.id,
          icon: data.icon || '🚗',
          summary: data.summary || data.description || '',
          freeManeuverIds: freeIds,
          exclusiveManeuverIds: exclusiveIds,
          ...data
        } as SystemDrive;
      });


      // Granular fallback logic
      if (fetchedSkills.length > 0) {
        setSkills(fetchedSkills);
      } else {
        console.log('[RulesContext] Skills empty, using static fallback');
        setSkills(convertStaticSkills());
      }

      if (fetchedManeuvers.length > 0) {
        setManeuvers(fetchedManeuvers);
      } else {
        console.log('[RulesContext] Maneuvers empty, using static fallback');
        setManeuvers(convertStaticManeuvers());
      }

      if (fetchedGifts.length > 0) {
        setGifts(fetchedGifts);
      } else {
        console.log('[RulesContext] Gifts empty, using static fallback');
        setGifts(convertStaticGifts());
      }

      if (fetchedDrives.length > 0) {
        setDrives(fetchedDrives);
      } else {
        console.log('[RulesContext] Drives empty, using static fallback');
        setDrives(convertStaticDrives());
      }
    } catch (err) {
      console.error('[RulesContext] Error fetching rules:', err);
      setError(err as Error);
      // Fallback to static data on error
      setSkills(convertStaticSkills());
      setManeuvers(convertStaticManeuvers());
      setGifts(convertStaticGifts());
      setDrives(convertStaticDrives());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Derived data
  const skillNames = useMemo(() =>
    skills.map(s => s.name).sort(),
    [skills]
  );

  const skillManeuvers = useMemo(() => {
    const map: Record<string, SystemManeuver[]> = {};
    for (const m of maneuvers) {
      if (m.skillId) {
        if (!map[m.skillId]) map[m.skillId] = [];
        map[m.skillId].push(m);
      }
    }
    return map;
  }, [maneuvers]);

  const generalManeuvers = useMemo(() =>
    maneuvers.filter(m => {
      const type = (m.type || '').toLowerCase();
      // Include if explicitly general/geral OR if it has no specific type but also no skill/drive association
      return type === 'general' || type === 'geral' || (!m.skillId && !m.driveId && !type.includes('drive') && !type.includes('skill'));
    }),
    [maneuvers]
  );

  const resolvedDrives = useMemo((): ResolvedDrive[] => {
    return drives.map(d => ({
      id: d.id,
      name: d.name,
      icon: d.icon,
      summary: d.summary,
      // More robust filtering for free/exclusive maneuvers
      freeManeuvers: maneuvers.filter(m =>
        // Match by ID
        d.freeManeuverIds?.includes(m.id) ||
        // OR Match by driveId property and type 'drive_free'
        (m.driveId === d.id && (m.type === 'drive_free' || m.cost === 0))
      ),
      exclusiveManeuvers: maneuvers.filter(m =>
        // Match by ID in list
        d.exclusiveManeuverIds?.includes(m.id) ||
        // OR Match by driveId property and NOT free
        (m.driveId === d.id && m.type !== 'drive_free' && m.cost !== 0)
      ),
    }));
  }, [drives, maneuvers]);

  // Helper functions
  const getDriveById = useCallback((id: DriveName) =>
    resolvedDrives.find(d => d.id === id),
    [resolvedDrives]
  );

  const getSkillManeuvers = useCallback((skillId: string) =>
    skillManeuvers[skillId] || [],
    [skillManeuvers]
  );

  const findGift = useCallback((id: string) =>
    gifts.find(g => g.id === id),
    [gifts]
  );

  const findManeuver = useCallback((id: string) =>
    maneuvers.find(m => m.id === id),
    [maneuvers]
  );

  const getAllManeuversForDrive = useCallback((driveId: DriveName) => {
    const drive = resolvedDrives.find(d => d.id === driveId);
    if (!drive) return [];
    return [...drive.freeManeuvers, ...drive.exclusiveManeuvers, ...generalManeuvers];
  }, [resolvedDrives, generalManeuvers]);

  const value: RulesContextValue = {
    skills,
    skillNames,
    skillManeuvers,
    drives: resolvedDrives,
    gifts,
    generalManeuvers,
    allManeuvers: maneuvers,
    isLoading,
    error,
    getDriveById,
    getSkillManeuvers,
    findGift,
    findManeuver,
    getAllManeuversForDrive,
    refetch: fetchRules,
  };

  return (
    <RulesContext.Provider value={value}>
      {children}
    </RulesContext.Provider>
  );
}

export function useRules() {
  const context = useContext(RulesContext);
  if (!context) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
}
