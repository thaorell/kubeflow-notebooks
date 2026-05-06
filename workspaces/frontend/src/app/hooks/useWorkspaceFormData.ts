import { useCallback } from 'react';
import { FetchState, FetchStateCallbackPromise, useFetchState } from 'mod-arch-core';
import { useNotebookAPI } from '~/app/hooks/useNotebookAPI';
import { WorkspaceFormData } from '~/app/types';
import {
  OptionsRedirectMessageLevel,
  WorkspacekindsWorkspaceKindListItem,
  WorkspacekindsWorkspaceKindUpdate,
} from '~/generated/data-contracts';

const convertUpdateToListItem = (
  name: string,
  update: WorkspacekindsWorkspaceKindUpdate,
): WorkspacekindsWorkspaceKindListItem => ({
  name,
  displayName: update.spawner.displayName,
  description: update.spawner.description,
  deprecated: update.spawner.deprecated ?? false,
  deprecationMessage: update.spawner.deprecationMessage ?? '',
  hidden: update.spawner.hidden ?? false,
  icon: { url: update.spawner.icon.url ?? '' },
  logo: { url: update.spawner.logo.url ?? '' },
  clusterMetrics: { workspacesCount: 0 },
  podTemplate: {
    podMetadata: {
      labels: update.podTemplate.podMetadata?.labels ?? {},
      annotations: update.podTemplate.podMetadata?.annotations ?? {},
    },
    volumeMounts: { home: update.podTemplate.volumeMounts.home },
    options: {
      imageConfig: {
        default: update.podTemplate.options.imageConfig.spawner.default,
        values: update.podTemplate.options.imageConfig.values.map((v) => ({
          id: v.id,
          displayName: v.spawner.displayName,
          description: v.spawner.description ?? '',
          hidden: v.spawner.hidden ?? false,
          labels: v.spawner.labels,
          redirect: v.redirect
            ? {
                to: v.redirect.to,
                message: v.redirect.message
                  ? {
                      level: v.redirect.message.level as unknown as OptionsRedirectMessageLevel,
                      text: v.redirect.message.text,
                    }
                  : undefined,
              }
            : undefined,
        })),
      },
      podConfig: {
        default: update.podTemplate.options.podConfig.spawner.default,
        values: update.podTemplate.options.podConfig.values.map((v) => ({
          id: v.id,
          displayName: v.spawner.displayName,
          description: v.spawner.description ?? '',
          hidden: v.spawner.hidden ?? false,
          labels: v.spawner.labels,
          redirect: v.redirect
            ? {
                to: v.redirect.to,
                message: v.redirect.message
                  ? {
                      level: v.redirect.message.level as unknown as OptionsRedirectMessageLevel,
                      text: v.redirect.message.text,
                    }
                  : undefined,
              }
            : undefined,
        })),
      },
    },
  },
});

export const EMPTY_FORM_DATA: WorkspaceFormData = {
  revision: '',
  kind: undefined,
  imageConfig: undefined,
  podConfig: undefined,
  properties: {
    homeVolume: undefined,
    volumes: [],
    secrets: [],
    workspaceName: '',
  },
};

const useWorkspaceFormData = (args: {
  namespace: string | undefined;
  workspaceName: string | undefined;
  workspaceKindName: string | undefined;
}): FetchState<WorkspaceFormData> => {
  const { namespace, workspaceName, workspaceKindName } = args;
  const { api, apiAvailable } = useNotebookAPI();

  const call = useCallback<FetchStateCallbackPromise<WorkspaceFormData>>(async () => {
    if (!apiAvailable) {
      throw new Error('API not yet available');
    }

    if (!namespace || !workspaceName || !workspaceKindName) {
      return EMPTY_FORM_DATA;
    }

    const [workspaceEnvelope, workspaceKindEnvelope] = await Promise.all([
      api.workspaces.getWorkspace(namespace, workspaceName),
      api.workspaceKinds.getWorkspaceKind(workspaceKindName),
    ]);
    const workspaceUpdate = workspaceEnvelope.data;
    const workspaceKind = convertUpdateToListItem(workspaceKindName, workspaceKindEnvelope.data);
    const { imageConfig, podConfig } = workspaceUpdate.podTemplate.options;

    return {
      revision: workspaceUpdate.revision,
      kind: workspaceKind,
      imageConfig,
      podConfig,
      properties: {
        workspaceName,
        volumes: workspaceUpdate.podTemplate.volumes.data.map((volume) => ({
          ...volume,
          isAttached: true,
        })),
        secrets:
          workspaceUpdate.podTemplate.volumes.secrets?.map((secret) => ({
            ...secret,
            isAttached: true,
          })) ?? [],
        // The update API returns home as a plain string (the PVC name). Reconstruct
        // a minimal volume value so the Home Volume section can display it.
        homeVolume: workspaceUpdate.podTemplate.volumes.home
          ? {
              pvcName: workspaceUpdate.podTemplate.volumes.home,
              mountPath: '',
              readOnly: false,
              isAttached: true,
            }
          : undefined,
      },
    };
  }, [api, apiAvailable, namespace, workspaceName, workspaceKindName]);

  return useFetchState(call, EMPTY_FORM_DATA);
};

export default useWorkspaceFormData;
