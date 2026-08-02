# 開発規則

ソフトウェア開発で使用する、プロジェクトに依存しない設計規則、言語固有規則、UI規則、仕様書作成規則を管理する。

## 文書

| 文書 | 対象 |
| --- | --- |
| `arch-rules.md` | ソフトウェアの種別と言語に依存しない設計原則。 |
| `app-arch-rules.md` | アプリケーションとソースコードの構成。 |
| `typescript-rules.md` | TypeScript固有の構成と検証。 |
| `rust-rules.md` | Rust固有の構成と検証。 |
| `flutter-rules.md` | Flutter固有の構成、BLoC、依存方向、検証。 |
| `web-design-rules.md` | Web UIのデザイン値、部品、状態、操作。 |
| `api-spec-rules.md` | API仕様書の構成と記述方法。 |
| `ui-spec-rules.md` | UI仕様書の構成と記述方法。 |

## 利用方法

利用するプロジェクトは、このリポジトリをsubmoduleとして固定する。プロジェクト固有の要件、採用技術、設計判断は、利用するプロジェクトのリポジトリで管理する。

```bash
git submodule add https://github.com/yuusakuri/dev-rules.git <path>
```

## 更新方法

利用するプロジェクトごとに、採用するバージョンのタグを指定する。

```bash
git -C <path> fetch --tags
git -C <path> checkout <release-tag>
git add <path>
```

## バージョン

バージョンはSemantic Versioningで管理する。既存規則の意味または必須条件を変える場合はメジャーバージョンを上げ、後方互換性のある規則を加える場合はマイナーバージョンを上げ、誤記や曖昧さを訂正する場合はパッチバージョンを上げる。
