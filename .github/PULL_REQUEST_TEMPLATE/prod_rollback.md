# 🚀 Production Rollback Release PR

> **Title format:** `[Prod] Rollback to vX.X.X From vX.X.X`

> Instructions for rollback: 
> 1. Remove `# {"$imagepolicy": "flux-system:frontend:tag"}` from the file `k8s/overlays/production/kustomization.yaml`
> 2. Set the desired version manually in `k8s/overlays/production/kustomization.yaml`

> Notes: Only do this on the **production** file unless you intentionally want to revert staging as well. Typically you should only need to rollback on production. 

> When you are ready to resume normal prod release, simply add the `# {"$imagepolicy": "flux-system:frontend:tag"}` back to the file, and run npm version as usual

## 📦 Release Type
_Select the appropriate release type by marking with an `x`._

- [x] Rollback version to previous
- [] Rollback version to a version other than the previous one

### Rollback Version From
_Note the relevant version rolling back from_

vX.X.X

## 🔁 Environment Promotion
This release promotes rollback of changes **to `production`**.

## 📋 Reason for Rollback
_Provide a summary of the reason(s) for rollback._

- 
- 
- 

## ✅ Checklist

- [] Version number is updated correctly
- [] Comment for tag on production kustomization yaml has been removed
- [] Rollbacked from version has been updated
- [] Title follows the required format: `[Prod] Rollback to vX.X.X From vX.X.X`

---

_This template is for versioned production rollbacks only. For other PR types, please select a different template._