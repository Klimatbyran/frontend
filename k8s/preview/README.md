# PR preview environments

Pull requests labeled **`preview`** get a temporary frontend deployment at:

`https://pr-<number>.stage.klimatkollen.se`

The preview uses the same **Garbo stage** API as `stage.klimatkollen.se` (`garbo.garbo-stage.svc.cluster.local`).

Deployment is handled by [`.github/workflows/pr-preview.yml`](../../.github/workflows/pr-preview.yml). Removing the `preview` label or closing the PR deletes the preview resources.

## One-time cluster setup

### 1. GitHub Actions secret

Add repository secret **`KUBE_CONFIG`**: base64-encoded kubeconfig for a service account that can create/update/delete resources in namespace `frontend-preview`.

```bash
cat ~/.kube/config | base64 | pbcopy   # macOS; paste into GitHub → Settings → Secrets
```

### 2. Namespace and API key secret

```bash
kubectl apply -f k8s/preview/namespace.yaml
kubectl apply -f k8s/preview/backend-service.yaml

# Copy the same env secret used by staging (Garbo API key for nginx proxy)
kubectl get secret env -n frontend-stage -o yaml \
  | sed 's/namespace: frontend-stage/namespace: frontend-preview/' \
  | kubectl apply -f -
```

### 3. DNS

Point wildcard hostnames at your ingress load balancer (same target as `stage.klimatkollen.se`):

| Record | Example |
|--------|---------|
| `*.stage.klimatkollen.se` | `pr-42.stage.klimatkollen.se` |

cert-manager issues a certificate per preview host via the `letsencrypt-prod` cluster issuer (HTTP-01), same as staging.

### 4. GitHub label

Create label **`preview`** in the repository (Issues → Labels → New label).

## Usage

1. Open a PR from a branch in **this repository** (fork PRs are skipped for security).
2. Add the **`preview`** label.
3. Wait for the **PR Preview Deploy** workflow; a bot comment will link the URL.
4. Push new commits — the preview redeploys while the label remains.
5. Remove the label or merge/close the PR to tear down.

## Manual render (debugging)

```bash
export PR_NUMBER=42
export IMAGE=ghcr.io/klimatbyran/frontend:pr-42-abc1234
export PREVIEW_HOST=pr-42.stage.klimatkollen.se
./k8s/preview/render.sh | kubectl apply -f -
```
