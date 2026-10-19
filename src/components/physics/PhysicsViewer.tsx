'use client';

import { useEffect, useState } from 'react';

import { physicsApi } from '@/services/physics';
import { SceneCanvas, buildObjects, type Frame, type ObjectState } from './SceneCanvas';

type SnapshotItem = {
  ref: number;
  title: string;
  preset: string;
  width: number;
  height: number;
  depth: number;
  model_url: string | null;
};

export function PhysicsViewer({ simulationId }: { simulationId: string }) {
  const [objects, setObjects] = useState<ObjectState[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        let sim = await physicsApi.getSimulation(simulationId);
        let s: string = sim.status;

        while (!cancelled && (s === 'pending' || s === 'running')) {
          setStatus(s);
          await new Promise((r) => setTimeout(r, 1000));
          sim = await physicsApi.getSimulation(simulationId);
          s = sim.status;
        }
        if (cancelled) return;
        setStatus(s);

        if (s !== 'done') {
          setLoading(false);
          return;
        }

        const snapshot: SnapshotItem[] = Array.isArray(sim.objects_snapshot)
          ? sim.objects_snapshot
          : [];
        const infoByRef = new Map(snapshot.map((it) => [it.ref, it]));

        const response = await physicsApi.getSimulationFrames(simulationId);
        const frames: Frame[] = Array.isArray(response) ? response : response.results || [];

        if (!cancelled) setObjects(buildObjects(frames, infoByRef));
      } catch (e) {
        console.error('Erreur chargement simulation:', e);
        if (!cancelled) setStatus('failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [simulationId]);

  if (loading || status === 'pending' || status === 'running') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">
          {status === 'running' ? 'Simulation en cours…' : 'Préparation de la simulation…'}
        </p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center justify-center h-full text-rose-500 text-sm">
        La simulation a échoué.
      </div>
    );
  }

  if (objects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        Aucune frame pour cette simulation.
      </div>
    );
  }

  return <SceneCanvas objects={objects} />;
}

export default PhysicsViewer;
