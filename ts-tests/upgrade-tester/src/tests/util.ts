import { SubmittableExtrinsic } from '@polkadot/api/types';
import { DispatchError } from '@polkadot/types/interfaces';
import { KeyringPair } from '@polkadot/keyring/types';

export function makeTx(tx: SubmittableExtrinsic<'promise'>, signer: KeyringPair): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.signAndSend(signer, async (status) => {
      if (status.isFinalized) {
        for (const e of status.events) {
          const { data, method, section } = e.event;
          if (section === 'system') {
            if (method === 'ExtrinsicSuccess') {
              resolve();
            } else if (method === 'ExtrinsicFailed') {
              const errorData = data[0] as DispatchError;
              let errorInfo: string;
              if (errorData.isModule) {
                const details = this.registry.findMetaError(errorData.asModule.toU8a());
                errorInfo = `${details.section}::${details.name}: ${details.documentation[0]}`;
              } else if (errorData.isBadOrigin) {
                errorInfo = 'TX Error: invalid sender origin';
              } else if (errorData.isCannotLookup) {
                errorInfo = 'TX Error: cannot lookup call';
              } else {
                errorInfo = 'TX Error: unknown';
              }
              reject(new Error(errorInfo));
            }
          }
        }
      } else if (status.isError) {
        reject(new Error(`Failed to submit tx '${tx.method.method}'`));
      }
    });
  });
}
