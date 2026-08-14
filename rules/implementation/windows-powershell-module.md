# Windows PowerShell モジュール開発規約

> 適用対象: Windows PowerShell 5.1向けモジュールのソースコード、テスト、ビルド、配布、プロジェクト構成を変更する場合。

## 1. 環境

| 項目 | 規則 |
| --- | --- |
| PowerShell | Windows PowerShell 5.1 |
| PowerShell エディション | `Desktop` |
| 実行ファイル | `powershell.exe` |
| ビルド | ModuleBuilder |
| フォーマット・静的解析 | PSScriptAnalyzer |
| テスト | Pester |
| パッケージ管理 | Microsoft.PowerShell.PSResourceGet |

### 1.1 実行ポリシー

開発・検証用スクリプトを実行ポリシーによって停止させずに実行するため、以下のいずれかを設定する。

| 設定 | 説明 |
| --- | --- |
| `Bypass` | すべてのスクリプトを警告や確認なしで実行可能。 |
| `RemoteSigned` | ローカルで作成したスクリプトは実行可能。インターネットから取得したスクリプトは、信頼された発行元によって署名されている場合に実行可能。 |

実行ポリシーを `Bypass` に設定する方法を次に示す。

| 設定方法 | 実行例 |
| --- | --- |
| ユーザースコープ | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass -Force` |
| プロセススコープ | `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force` |
| `powershell.exe` の起動引数 | `powershell.exe -ExecutionPolicy Bypass` |

### 1.2 パッケージ管理

Windows PowerShell 5.1へ `Microsoft.PowerShell.PSResourceGet` を導入し、開発ツールと配布モジュールを管理する。

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

Install-PackageProvider -Name NuGet -Scope CurrentUser -Force
Install-Module -Name PowerShellGet -Scope CurrentUser -Repository PSGallery -Force -AllowClobber
Install-Module -Name Microsoft.PowerShell.PSResourceGet -Scope CurrentUser -Repository PSGallery
```

### 1.3 開発ツール

ModuleBuilder、PSScriptAnalyzer、Pesterは開発時とCIで使用するモジュールとし、`required-modules.psd1`へ必要なバージョンと取得先を記載する。

```powershell
@{
    ModuleBuilder = @{
        version = '<version>'
        repository = 'PSGallery'
    }

    PSScriptAnalyzer = @{
        version = '<version>'
        repository = 'PSGallery'
    }

    Pester = @{
        version = '<version>'
        repository = 'PSGallery'
    }
}
```

開発ツールは、`required-modules.psd1`をもとに、`Install-PSResource -RequiredResourceFile`を使用して現在の利用者のモジュールディレクトリへ導入する。

```powershell
Install-PSResource -RequiredResourceFile './required-modules.psd1' -Scope CurrentUser
```

---

## 2. リポジトリ構成

| パス | 用途 |
| --- | --- |
| `src/<ModuleName>/<ModuleName>.psd1` | 人が管理するソースマニフェスト。ビルド時に配布先へコピーされる。 |
| `src/<ModuleName>/build.psd1` | ModuleBuilder のビルド設定。 |
| `src/<ModuleName>/Public/` | 公開関数。 |
| `src/<ModuleName>/Private/` | 内部関数。 |
| `src/<ModuleName>/data/` | 実行時に使用するデータファイル。使用する場合だけ配置する。 |
| `src/<ModuleName>/formats/` | `.format.ps1xml`。使用する場合だけ配置する。 |
| `src/<ModuleName>/types/` | `.types.ps1xml`。使用する場合だけ配置する。 |
| `tests/unit/` | 単体テスト。 |
| `tests/integration/` | OS や外部コンポーネントとの統合テスト。 |
| `tests/contract/` | ビルド済みマニフェストと公開関数の Help の契約テスト。 |
| `.gitattributes` | PowerShellソースファイルの改行コードをLFへ統一するGit属性。 |
| `required-modules.psd1` | ModuleBuilder、PSScriptAnalyzer、Pesterのバージョンと取得先。 |
| `PSScriptFormatterSettings.psd1` | `Invoke-Formatter` の設定。 |
| `PSScriptAnalyzerSettings.psd1` | `Invoke-ScriptAnalyzer` の設定。 |
| `.github/workflows/ci.yml` | GitHub Actions を使用する場合の CI ワークフロー。 |
| `run.ps1` | 開発・検証処理をサブコマンド単位で実行するスクリプト。 |
| `output/<ModuleName>/` | 生成した `.psm1`、コピー・更新した `.psd1` などの配布成果物。 |

公開関数と内部関数は1関数1ファイルとし、ファイル名を関数名と一致させる。`Public` と `Private` の `.ps1` は開発用の分割ソースとして扱い、配布物へそのまま含めない。

`output/<ModuleName>/` には実行に必要なファイルだけを配置する。テスト、ビルド用ファイル、フォーマット設定、静的解析設定、`build.psd1`、分割されたソースファイルは含めない。

---

## 3. ソースファイル

| 項目 | 規則 |
| --- | --- |
| エンコーディング | UTF-8（BOMなし） |
| 改行コード | LF |
| 文字 | ASCII-only |
| 対象拡張子 | `.ps1`、`.psd1`、`.ps1xml` |
| LF検査 | `[System.IO.File]::ReadAllBytes()` で読み込み、`0x0D` を含まないことを確認する。 |

`.gitattributes`には、対象拡張子をLFへ統一するGit属性を記載する。

```gitattributes
*.ps1 text eol=lf
*.psd1 text eol=lf
*.ps1xml text eol=lf
```

`.psm1` は ModuleBuilder がビルド時に生成する配布成果物であり、ソースファイルとして管理しない。

---

## 4. モジュールマニフェスト

`src/<ModuleName>/<ModuleName>.psd1` は人が管理するソースマニフェストとし、モジュールのメタデータと実行時依存関係を記述する。ModuleBuilder はこれを `output/<ModuleName>/<ModuleName>.psd1` へコピーし、公開関数などビルドで確定する項目を更新する。

| 項目 | 規則 |
| --- | --- |
| `RootModule` | ModuleBuilder が生成するスクリプトモジュールのファイル名を指定する。 |
| `ModuleVersion` | 配布バージョンを指定する。 |
| `Author` | モジュールの作成者を指定する。 |
| `Description` | モジュールの用途を説明する。 |
| `PrivateData.PSData.LicenseUri` | PowerShell Gallery へ公開するモジュールではライセンスの URL を指定する。 |
| `PowerShellVersion` | `5.1` を指定する。 |
| `CompatiblePSEditions` | `Desktop` を指定する。 |
| `FunctionsToExport` | ソースでは `@()` とし、ModuleBuilder が `Public/*.ps1` から明示的な関数名を反映する。 |
| `TypesToProcess` | `.types.ps1xml` を使用する場合だけ指定する。 |
| `FormatsToProcess` | `.format.ps1xml` を使用する場合だけ指定する。 |

ASCII-only UTF-8でマニフェストを作成するには、以下を実行する。`<ModuleName>` は作成するモジュールの名前に変更する。

```powershell
$manifestPath = Join-Path $PWD '<ModuleName>.psd1'
$previousUICulture = [System.Threading.Thread]::CurrentThread.CurrentUICulture
[System.Threading.Thread]::CurrentThread.CurrentUICulture = [System.Globalization.CultureInfo]::GetCultureInfo('en-US')

New-ModuleManifest -Path $manifestPath

[System.Threading.Thread]::CurrentThread.CurrentUICulture = $previousUICulture
$content = [System.IO.File]::ReadAllText($manifestPath)
[System.IO.File]::WriteAllText($manifestPath, $content, [System.Text.UTF8Encoding]::new($false))
```

---

## 5. ビルド

開発時は `src/<ModuleName>/` でソースを分割して管理し、ModuleBuilder の `Build-Module` で配布用モジュールを `output/<ModuleName>/` に生成する。

ビルド前に既存の `output/<ModuleName>/` を削除し、以前の成果物が残らない状態で生成する。

ModuleBuilder によるビルドでは、以下の処理が行われる。

| 項目 | ModuleBuilder の動作 |
| --- | --- |
| スクリプトモジュール | ModuleBuilder が `Public` と `Private` のソースを統合し、単一の `output/<ModuleName>/<ModuleName>.psm1` を生成する。 |
| 配布マニフェスト | ModuleBuilder が `src/<ModuleName>/<ModuleName>.psd1` を `output/<ModuleName>/<ModuleName>.psd1` へコピーし、ビルド時に必要な項目を更新する。 |
| 公開関数 | ModuleBuilder が `Public/*.ps1` のファイル名から `FunctionsToExport` を生成する。 |

`src/<ModuleName>/build.psd1` では、ソースマニフェスト、出力先、エンコーディング、配布成果物へコピーするディレクトリを指定する。

```powershell
@{
    Path = '<ModuleName>.psd1'
    OutputDirectory = '../../output'
    UnversionedOutputDirectory = $true
    Encoding = 'ASCII'
    CopyPaths = @()
}
```

`CopyPaths` には、配布対象として実際に存在するサブディレクトリだけを追加する。`data/`、`formats/`、`types/` を使用する場合は `CopyPaths` に追加する。

Windows PowerShell 5.1 では `UTF8NoBom` を指定できないため、ModuleBuilder は `Encoding = 'ASCII'` とする。

ModuleBuilderによる生成とマニフェストの更新後に、配布する `.ps1`、`.psm1`、`.psd1`、`.ps1xml` をUTF-8（BOMなし）かつLFへ変換する。

```powershell
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$outputFiles = Get-ChildItem -LiteralPath './output/<ModuleName>' -Recurse -File |
    Where-Object { $_.Extension -in @('.ps1', '.psm1', '.psd1', '.ps1xml') }

foreach ($outputFile in $outputFiles) {
    $content = [System.IO.File]::ReadAllText($outputFile.FullName)
    $content = $content.Replace("`r`n", "`n").Replace("`r", "`n")
    [System.IO.File]::WriteAllText($outputFile.FullName, $content, $utf8NoBom)
}
```

---

## 6. 命名

| 項目 | 規則 | 例 |
| --- | --- | --- |
| 関数 | `<Verb>-<Noun>` の形式にする。`<Verb>` には `Get-Verb` で確認できる承認済みの動詞を使う。`<Noun>` は複数の値を表す場合も単数形にする。 | `Get-ComputerState` |
| 公開関数 | `<Noun>` の先頭にモジュール固有の `<Prefix>` を付ける。 | `Get-MyModuleComputer` |
| パラメーター | PascalCase にする。複数の値を表す場合も単数形にする。 | `$ComputerName` |
| 出力プロパティ | PascalCase にする。 | `ComputerName` |
| 型 | PascalCase にする。 | `MyModule.Computer` |
| ローカル変数 | camelCase にする。複数の値を表す場合は複数形にする。 | `$computerNames` |
| スクリプトスコープ変数 | PascalCase にする。複数の値を表す場合は複数形にする。 | `$script:ComputerNames` |

---

## 7. 関数

### 7.1 関数種別

公開関数は `[CmdletBinding()]` を使用した高度な関数とする。`[CmdletBinding()]` を使用すると共通パラメーターと `$PSCmdlet` が利用可能になる。

```powershell
function Get-MyModuleMonitor {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    # Processing
}
```

名前付きブロックを使用しない関数では、関数本体のコードは `end` 相当として1回実行される。`begin`、`process`、`end` のいずれかの名前付きブロックを使用する場合は、関数本体の実行コードを名前付きブロックの外へ置かない。

### 7.2 出力型

公開関数が安定した型のオブジェクトを返す場合は `[OutputType()]` を宣言する。

```powershell
[OutputType('MyModule.Monitor')]
```

### 7.3 パラメーター名

PowerShell で一般的な概念には、一般的なパラメーター名を使用する。

| パラメーター名 | 用途 |
| --- | --- |
| `Name` | 名前で対象を指定する。 |
| `Path` | ワイルドカードを解釈するパスを指定する。 |
| `LiteralPath` | ワイルドカードを解釈しないパスを指定する。 |
| `Credential` | 認証に使用する資格情報を指定する。 |
| `InputObject` | 処理対象のオブジェクトを直接指定する。 |
| `Force` | 上書き防止、保護状態など、モジュール独自の保護を明示的に越える。 |
| `PassThru` | 通常は出力しないコマンドから処理結果を返す。 |
| `Recurse` | 子要素を再帰的に処理する。 |

パラメーターエイリアスは、PowerShell で広く使われる互換名が必要な場合だけ使用する。

### 7.4 型と必須指定

意図的に任意の型を受け取る場合を除き、パラメーターには型を指定する。必須パラメーターには `Mandatory = $true` を指定する。

### 7.5 位置パラメーター

位置指定での利用が自然なパラメーターには `Position` を指定してよい。`Position` を指定する場合は、利用者が理解しやすい順序を明示する。

### 7.6 真偽オプション

真偽だけを指定する利用者向けオプションには `[bool]` ではなく `[switch]` を使用する。デフォルト値は指定せず、スイッチを指定しない状態を最も単純で一般的な動作にする。

スイッチの値そのものを評価する。`-Force:$false` のように明示的な偽を渡せるため、パラメーターが指定されたかどうかだけで動作を決めない。

### 7.7 資格情報

ユーザー名とパスワードを組として受け取る認証情報には `[PSCredential]` を使用し、原則として `Credential` というパラメーター名にする。

### 7.8 秘密値

ユーザー名を伴わない秘密値を対象 API が `SecureString` として要求する場合は `[SecureString]` を使用する。認証情報を表す場合は `[PSCredential]` を優先する。

### 7.9 検証

入力値の制約の判定は、パラメーターの検証属性を積極的に使用する。

| 検証内容 | 属性 | 例 |
| --- | --- | --- |
| `null` を許可しない | `[ValidateNotNull()]` | `[ValidateNotNull()] [object]$InputObject` |
| `null`、空文字列、空コレクションを許可しない | `[ValidateNotNullOrEmpty()]` | `[ValidateNotNullOrEmpty()] [string]$Name` |
| 数値を指定した範囲に制限する | `[ValidateRange()]` | `[ValidateRange(1, 65535)] [int]$Port` |
| 指定できる値を列挙する | `[ValidateSet()]` | `[ValidateSet('Low', 'High')] [string]$Level` |
| 文字列の形式を正規表現で制限する | `[ValidatePattern()]` | `[ValidatePattern('^[A-Z]{3}$')] [string]$Code` |
| 他の検証属性で表現できない条件を検証する | `[ValidateScript()]` | `[ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })] [string]$Path` |

### 7.10 パラメーターセット

異なる入力方法または処理方式を分離する場合は パラメーターセットを使用する。最も一般的な入力方法を `DefaultParameterSetName` に指定する。

パラメーターセットによる分岐には `$PSCmdlet.ParameterSetName` を、パラメーターが明示的に指定されたかの判定には `$PSBoundParameters` を使用する。

```powershell
[CmdletBinding(DefaultParameterSetName = 'ByName')]
param(
    [Parameter(Mandatory = $true, ParameterSetName = 'ByName')]
    [string]$Name,

    [Parameter(Mandatory = $true, ParameterSetName = 'ById')]
    [int]$Id,

    [int]$Limit = 100
)

switch ($PSCmdlet.ParameterSetName) {
    'ByName' { $selectedValue = $Name }
    'ById'   { $selectedValue = $Id }
}

if ($PSBoundParameters.ContainsKey('Limit')) {
    $selectedLimit = $Limit
}
```

---

## 8. パイプライン

### 8.1 パイプライン入力

公開関数が複数の対象を1件ずつ同じ方法で処理でき、他の PowerShell コマンドの出力をそのまま入力として利用できる場合は、パイプライン入力を受け取れるようにする。

| 属性 | 用途 |
| --- | --- |
| `ValueFromPipeline` | パイプラインから渡された値またはオブジェクト全体をバインドする。 |
| `ValueFromPipelineByPropertyName` | 入力オブジェクトの同名プロパティまたはパラメーターエイリアスの値をバインドする。 |

### 8.2 パイプライン処理

| ブロック | 実行タイミング | 用途 |
| --- | --- | --- |
| `begin` | 関数呼び出し全体で1回 | 全入力で共有する事前検証、コマンド解決、初期化。 |
| `process` | パイプライン内では入力オブジェクトごと。通常の関数呼び出しでは1回 | 入力1件単位の処理。 |
| `end` | 入力処理終了後に1回 | 集計結果の出力、入力全体を処理した後の後処理。 |

パイプライン入力を受け取る関数では `process` を定義し、バインド先のパラメーター変数を使用して入力1件単位で処理する。

`$_` または `$PSItem` は、`Where-Object`、`ForEach-Object`、`catch` など、PowerShell が現在のオブジェクトを提供するコンテキストで使用する。高度な関数自身のパイプライン入力を参照する場合は、バインド先のパラメーター変数を使用する。`$input` も通常のパイプライン入力処理には使用しない。

同じパラメーターで、直接指定された複数値とパイプライン入力の両方を受け付ける場合は配列型にし、`process` 内でその配列を `foreach` する。

```powershell
function Get-MyModuleMonitor {
    [CmdletBinding()]
    param(
        [Parameter(
            Mandatory = $true,
            ValueFromPipeline = $true,
            ValueFromPipelineByPropertyName = $true
        )]
        [ValidateNotNullOrEmpty()]
        [string[]]$Name
    )

    process {
        foreach ($currentName in $Name) {
            Get-MyModuleMonitorInternal -Name $currentName
        }
    }
}
```

確実な解放が必要なリソースは、可能な限り同じ `process` 反復または内部関数の `try/finally` 内で取得から解放まで完結させる。パイプライン全体にまたがるリソースを `begin` で取得して `end` だけで解放する設計は避ける。

### 8.3 逐次出力と集計

各入力の結果を独立して確定できる場合は、結果を配列へためず `process` から逐次出力する。

入力全体を使った集計が必要な場合は、`begin` で集計用状態を初期化し、`process` で更新し、`end` で最終結果を出力する。

```powershell
function Measure-MyModuleValue {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [int[]]$Value
    )

    begin {
        $total = 0
    }

    process {
        foreach ($currentValue in $Value) {
            $total += $currentValue
        }
    }

    end {
        $total
    }
}
```

---

## 9. 出力

### 9.1 データ出力

公開コマンドは、後続の PowerShell コマンドやスクリプトで再利用できるオブジェクトを返す。

通常のオブジェクト出力は式として記述する。複数の名前付きプロパティを持つ構造化データを返す場合は `[PSCustomObject]` を使用する。公開関数がモジュール固有の構造化データを返す場合は、`PSTypeName` にモジュール固有の型名を設定する。

```powershell
[PSCustomObject]@{
    PSTypeName = 'MyModule.Monitor'
    Name = $monitor.Name
    Status = $monitor.Status
}
```

`return` は値を返すための必須構文として使用せず、現在の関数またはスクリプトブロックからその時点で抜ける必要がある場合に使用する。

### 9.2 メッセージ出力

| 内容 | 使用するもの |
| --- | --- |
| 詳細情報 | `Write-Verbose` |
| デバッグ情報 | `Write-Debug` |
| 注意 | `Write-Warning` |
| 情報 | `Write-Information` |

`Write-Host` は使用しない。

### 9.3 表示形式

公開関数では、通常の戻り値を `Format-Table`、`Format-List` などの `Format-*` で加工しない。表示形式を定義する必要がある場合は `.format.ps1xml` を使用し、関数自体は元のオブジェクトを返す。

### 9.4 JSON

`ConvertTo-Json` を使用する場合は、必要なオブジェクト階層を含む `-Depth` を明示する。Windows PowerShell 5.1 の既定値は `2` であり、深いオブジェクトを既定値のまま変換しない。

```powershell
$json = $value | ConvertTo-Json -Depth 10
```

---

## 10. エラー処理

### 10.1 エラーの種類

終了エラーと非終了エラーは、現在の入力だけを処理できないのか、後続の入力も含めて関数を継続できないのかで使い分ける。

| 状況 | 規則 |
| --- | --- |
| 現在の入力だけを処理できない | `Write-Error` で非終了エラーを通知し、後続の入力を処理する。呼び出し側は、必要に応じて `-ErrorAction Stop` で終了エラーとして扱える。 |
| 後続の入力も含めて関数を正常に継続できない | 終了エラーとする。 |

公開 API としてエラー識別子、カテゴリ、関連オブジェクトを明示する必要がある場合は `ErrorRecord` を作成し、終了エラーには `$PSCmdlet.ThrowTerminatingError()`、非終了エラーには `$PSCmdlet.WriteError()` を使用する。それ以外の終了エラーには `throw` を使用する。

### 10.2 エラーの捕捉と伝播

下位コマンドレットのエラーを現在の処理で捕捉する場合は、対象呼び出しに `-ErrorAction Stop` を指定して `try/catch` を使用する。捕捉した `ErrorRecord` を非終了エラーとして伝播する場合は `Write-Error -ErrorRecord $_` を使用する。

```powershell
foreach ($pathItem in $Path) {
    try {
        $content = Get-Content -LiteralPath $pathItem -ErrorAction Stop
    }
    catch {
        Write-Error -ErrorRecord $_
        continue
    }

    # Processing
}
```

---

## 11. 状態変更

### 11.1 実行確認

ファイル、レジストリ、サービス、設定、外部システムなどの状態を変更する関数では、公開関数・内部関数を問わず `SupportsShouldProcess = $true` を指定する。

状態変更の直前に `$PSCmdlet.ShouldProcess()` を評価し、真の場合だけ変更を実行する。これにより `-WhatIf` と `-Confirm` が PowerShell の標準動作として利用できる。

`ShouldProcess()` に加えて追加確認が必要な場合は `$PSCmdlet.ShouldContinue()` を使用する。

```powershell
function Set-MyModuleMonitorInternal {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    if ($PSCmdlet.ShouldProcess($Name, 'Update')) {
        # Apply the change.
    }
}
```

### 11.2 保護と結果出力

| パラメーター | 規則 |
| --- | --- |
| `Force` | 上書き防止、保護状態など、モジュール独自の保護を明示的に越える場合に使用する。`ShouldProcess()` は越えない。 |
| `PassThru` | 通常は出力しない変更コマンドから、変更後の結果を返す場合に使用する。 |

---

## 12. 外部実行ファイル

### 12.1 実行

外部実行ファイルの存在確認には `Get-Command` を使用し、`-CommandType Application` と `-ErrorAction Ignore` を指定する。

外部実行ファイルは呼び出し演算子 `&` で実行する。別ウィンドウ、待機、資格情報などのプロセス制御が必要な場合は `Start-Process` を使用する。

### 12.2 引数

コマンドと引数は分離し、引数は配列で管理する。

```powershell
$arguments = @(
    '--name'
    $Name
)

& example.exe $arguments
```

### 12.3 終了コードと出力

Windows PowerShell 5.1 では、外部実行ファイルの非0終了コードを PowerShell の終了エラーとして扱わない。外部実行ファイルの実行直後に `$LASTEXITCODE` を保存し、成否はその実行ファイル固有の終了コード仕様に従って判定する。

```powershell
$output = & example.exe $arguments
$exitCode = $LASTEXITCODE
```

標準出力を公開 API の出力として扱う場合は、必要に応じて解析し、構造化オブジェクトへ変換する。

### 12.4 標準入出力の文字コード

Windows PowerShell 5.1 では、PowerShell と外部実行ファイルの間で使用される文字コードが UTF-8 に統一されていない。

外部実行ファイルの標準入力・標準出力を UTF-8 とする必要がある場合は、`[Console]::OutputEncoding` と `$OutputEncoding` を UTF-8 に設定する。

```powershell
$utf8 = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8

$output = & example.exe $arguments
```

---

## 13. ファイル

### 13.1 パス

| 項目 | 規則 |
| --- | --- |
| リテラルパス | ワイルドカードを入力仕様としない場合は `-LiteralPath` を使用する。 |
| ワイルドカードパス | ワイルドカードを入力仕様とする場合だけ `-Path` を使用する。 |
| パス結合 | `Join-Path` を使用する。 |

### 13.2 エンコーディング

ファイルを読み書きする場合はエンコーディングを明示する。

Windows PowerShell 5.1 の `-Encoding UTF8` は UTF-8（BOMあり）であり、`UTF8NoBom` は使用できない。ASCII-only のファイルを生成する場合は、`Set-Content`、`Add-Content`、`Out-File`、`Export-Csv` などで `-Encoding Ascii` を明示する。

`$PSDefaultParameterValues['*:Encoding'] = 'utf8'` は Windows PowerShell 5.1 では BOM あり UTF-8 を指定するため、BOM なし UTF-8 の回避策として使用しない。

非 ASCII 文字を含む UTF-8（BOMなし）が必要な場合は、用途に応じて .NET Framework の API を使用し、`[System.Text.UTF8Encoding]::new($false)` を明示する。

| 用途 | API | 例 |
| --- | --- | --- |
| 文字列で全体を読み込む | `[System.IO.File]::ReadAllText` | `[System.IO.File]::ReadAllText($Path, [System.Text.UTF8Encoding]::new($false))` |
| 行の配列で全体を読み込む | `[System.IO.File]::ReadAllLines` | `[System.IO.File]::ReadAllLines($Path, [System.Text.UTF8Encoding]::new($false))` |
| 行を遅延列挙して読み込む | `[System.IO.File]::ReadLines` | `[System.IO.File]::ReadLines($Path, [System.Text.UTF8Encoding]::new($false))` |
| 内容を逐次読み込む | `[System.IO.StreamReader]` | `[System.IO.StreamReader]::new($Path, [System.Text.UTF8Encoding]::new($false))` |
| 文字列で全体を書き込む | `[System.IO.File]::WriteAllText` | `[System.IO.File]::WriteAllText($Path, $content, [System.Text.UTF8Encoding]::new($false))` |
| 行の配列で全体を書き込む | `[System.IO.File]::WriteAllLines` | `[System.IO.File]::WriteAllLines($Path, $lines, [System.Text.UTF8Encoding]::new($false))` |
| 文字列を追記する | `[System.IO.File]::AppendAllText` | `[System.IO.File]::AppendAllText($Path, $content, [System.Text.UTF8Encoding]::new($false))` |
| 行を追記する | `[System.IO.File]::AppendAllLines` | `[System.IO.File]::AppendAllLines($Path, $lines, [System.Text.UTF8Encoding]::new($false))` |
| 内容を逐次書き込む | `[System.IO.StreamWriter]` | `[System.IO.StreamWriter]::new($Path, $false, [System.Text.UTF8Encoding]::new($false))` |

### 13.3 PowerShellデータファイル

`.psd1` は `Import-PowerShellDataFile` で読み込む。ルートの型、必要なキー、値を検証し、すべての検証が成功してから状態を変更する。

---

## 14. 通信

### 14.1 Web 要求

Windows PowerShell 5.1 の Web 処理は、用途によって使用するコマンドまたはライブラリを分ける。

| 用途 | 使用するもの |
| --- | --- |
| HTTP のステータス、ヘッダー、本文を扱う | `System.Net.Http.HttpClient` |
| ファイルをダウンロードする | `System.Net.Http.HttpClient` |
| 追加ライブラリなしで HTML を解析する | `Invoke-WebRequest` |

#### 14.1.1 Invoke-RestMethod

JSON / XML の Web API を呼び出し、応答を PowerShell オブジェクトとして扱う場合に使用できる。JSON / XML の変換は PowerShell が行う。

HTTP ステータス、ヘッダー、本文そのものを扱う場合や、ファイルをダウンロードする場合は `HttpClient` を使用する。

#### 14.1.2 Invoke-WebRequest

追加ライブラリを使用せずに HTML を解析する場合に使用する。`-UseBasicParsing` を指定すると DOM 解析を行わず、HTTP ステータス、ヘッダー、本文を扱える。`-OutFile` でファイル保存もできる。

ファイルのダウンロードでは進捗表示によって処理が遅くなるため、`$ProgressPreference = 'SilentlyContinue'` を設定する。

```powershell
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -UseBasicParsing -Uri $Uri -OutFile $Path
```

#### 14.1.3 System.Net.Http.HttpClient

HTTP ステータス、ヘッダー、本文、バイナリデータ、ストリームを扱う場合に使用する。Web 要求の第一選択とし、使用前に `System.Net.Http` を明示的に読み込む。JSON は `ConvertFrom-Json`、XML は `[xml]` で PowerShell オブジェクトへ変換する。HTML 本文はサードパーティーライブラリ `AngleSharp` で解析する。

要求ごとに `HttpClient` を生成して破棄すると、高頻度の要求では接続の生成と破棄が繰り返され、利用可能なソケットが不足して `SocketException` が発生する場合がある。`HttpClient` は要求ごとに生成せず、モジュール内で再利用する。

```powershell
Add-Type -AssemblyName System.Net.Http

if ($null -eq $script:HttpClient) {
    $script:HttpClient = [System.Net.Http.HttpClient]::new()
}

$content = $script:HttpClient.GetByteArrayAsync($Uri).GetAwaiter().GetResult()
[System.IO.File]::WriteAllBytes($Path, $content)
```

大きなファイルをダウンロードする場合は、`HttpCompletionOption.ResponseHeadersRead` とストリームを使用し、レスポンス全体をメモリへ読み込まない。

### 14.2 TLS

Windows PowerShell 5.1 では、TLS 1.2 が既定で使用されず、TLS 1.2 以上を要求する HTTPS 接続で失敗する場合がある。

恒久対応では、管理者権限で .NET Framework 4.x の `SystemDefaultTlsVersions` と `SchUseStrongCrypto` を有効にし、OS が TLS バージョンを選択できるようにする。設定後は、対象の PowerShell プロセスを再起動する。

```powershell
$paths = @(
    'HKLM:\SOFTWARE\Microsoft\.NETFramework\v4.0.30319'
    'HKLM:\SOFTWARE\WOW6432Node\Microsoft\.NETFramework\v4.0.30319'
)

foreach ($path in $paths) {
    New-ItemProperty -Path $path -Name 'SystemDefaultTlsVersions' -Value 1 -PropertyType DWord -Force | Out-Null
    New-ItemProperty -Path $path -Name 'SchUseStrongCrypto' -Value 1 -PropertyType DWord -Force | Out-Null
}
```

恒久設定を変更できない場合は、現在の PowerShell プロセスで TLS 1.2 を一時的に有効にする。

```powershell
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12
```

---

## 15. コードスタイル

### 15.1 変数スコープ

| 状態 | スコープ |
| --- | --- |
| モジュール内部で共有 | `$script:` |
| 利用者のセッション全体 | モジュール内部状態として保持しない。 |

### 15.2 レイアウト

| 項目 | 規則 |
| --- | --- |
| インデント | 半角スペース4文字とする。 |
| 波括弧 | 開始波括弧は宣言・制御文と同じ行に置く。 |

### 15.3 改行

1行で読みやすいコードは1行で記述する。複数行のパイプラインはパイプ演算子の後で改行し、後続のコマンドをインデントする。

```powershell
Get-Process |
    Where-Object { $_.CPU -gt 100 } |
    Sort-Object -Property CPU -Descending |
    Select-Object -First 10
```

行継続のためにバッククォートを使用しない。パイプ、括弧、配列、ハッシュテーブルなど、PowerShell が自然に継続できる構文を使用する。

### 15.4 コマンド名

エイリアスではなく正式なコマンド名を使用する。

### 15.5 動的コード実行

`Invoke-Expression` を使用せず、外部から取得した値をコードとして実行しない。

### 15.6 .NET オブジェクト生成

.NET 型のインスタンスを直接生成できる場合は `[Type]::new(...)` を使用し、`New-Object` は使用しない。

### 15.7 引数指定

コマンド呼び出しでは位置引数に依存せず、パラメーター名を明示する。

複数のパラメーターをまとめることでコマンド呼び出しが読みやすくなる場合はスプラッティングを使用する。

```powershell
$parameters = @{
    LiteralPath = $Path
    ErrorAction = 'Stop'
}

Get-Content @parameters
```

### 15.8 比較

`$null` を比較する場合は `$null` を左辺に置く。

---

## 16. ヘルプ

公開関数にはコメントベースのヘルプを記述する。

| セクション | 規則 |
| --- | --- |
| `.SYNOPSIS` | 必須。コマンドの目的を記述する。 |
| `.DESCRIPTION` | 必須。動作、重要な条件、状態変更などを記述する。 |
| `.PARAMETER` | すべての公開パラメーターについて、その意味を記述する。 |
| `.EXAMPLE` | 1つ以上記述する。 |
| `.INPUTS` | パイプライン入力がある場合に、受け取る型を記述する。 |
| `.OUTPUTS` | 出力がある場合に、出力する型を記述する。 |

```powershell
<#
.SYNOPSIS
Gets monitor information.

.DESCRIPTION
Gets monitor information for the specified monitor name.

.PARAMETER Name
Specifies the monitor name.

.EXAMPLE
Get-MyModuleMonitor -Name 'DISPLAY1'

Gets information for DISPLAY1.

.INPUTS
System.String

.OUTPUTS
MyModule.Monitor
#>
```

---

## 17. 自動フォーマット

コードフォーマットには `Invoke-Formatter` を使用し、リポジトリ直下の `PSScriptFormatterSettings.psd1` を使用する。

```powershell
@{
    IncludeRules = @(
        'PSPlaceOpenBrace'
        'PSPlaceCloseBrace'
        'PSUseConsistentWhitespace'
        'PSUseConsistentIndentation'
    )

    Rules = @{
        PSPlaceOpenBrace = @{
            Enable = $true
            OnSameLine = $true
            NewLineAfter = $true
            IgnoreOneLineBlock = $true
        }

        PSPlaceCloseBrace = @{
            Enable = $true
            NewLineAfter = $false
            IgnoreOneLineBlock = $true
            NoEmptyLineBefore = $true
        }

        PSUseConsistentIndentation = @{
            Enable = $true
            Kind = 'space'
            IndentationSize = 4
            PipelineIndentation = 'IncreaseIndentationForFirstPipeline'
        }

        PSUseConsistentWhitespace = @{
            Enable = $true
            CheckInnerBrace = $true
            CheckOpenBrace = $true
            CheckOpenParen = $true
            CheckOperator = $true
            CheckPipe = $true
            CheckPipeForRedundantWhitespace = $false
            CheckSeparator = $true
            CheckParameter = $false
            IgnoreAssignmentOperatorInsideHashTable = $true
        }
    }
}
```

## 18. 構文チェック

PowerShellコードの構文チェックには `System.Management.Automation.Language.Parser` を使用し、各メソッドの解析エラー件数が0件であることを確認する。

| 対象 | メソッド |
| --- | --- |
| ファイル | `[System.Management.Automation.Language.Parser]::ParseFile()` |
| 文字列 | `[System.Management.Automation.Language.Parser]::ParseInput()` |

## 19. 静的解析

静的解析には PSScriptAnalyzer の `Invoke-ScriptAnalyzer` を使用し、リポジトリ直下の `PSScriptAnalyzerSettings.psd1` を使用する。既定ルールを使用し、重大度が `Error` または `Warning` の指摘を検査する。

```powershell
@{
    Severity = @(
        'Error'
        'Warning'
    )

    IncludeDefaultRules = $true

    ExcludeRules = @(
        'PSUseBOMForUnicodeEncodedFile'
    )

}
```

| 項目 | 検査 |
| --- | --- |
| 承認済み動詞 | 公開関数を検査する。内部関数も同じ命名方針を適用する。 |
| エイリアス | 正式なコマンド名を使用していることを検査する。 |
| `ShouldProcess` | 状態変更を行う公開関数・内部関数で `SupportsShouldProcess` が有効であり、`ShouldProcess()` が使用されていることを検査する。 |
| 危険な構文 | `Invoke-Expression` などを検査する。 |
| 未使用 | 未使用変数など PSScriptAnalyzer で検出可能なものを検査する。 |
| BOM | ソースは UTF-8（BOMなし）かつ ASCII-only とするため、`PSUseBOMForUnicodeEncodedFile` は除外する。 |

## 20. テスト

テストには Pester を使用する。Unit Test、Integration Test、Contract Test は、ビルド済みの `output/<ModuleName>/<ModuleName>.psd1` をインポートして実施する。

状態変更関数では、Unit Test または Integration Test の該当箇所で `-WhatIf` により状態変更が実行されないことを確認する。

### 20.1 Unit Test

入力、出力、分岐、検証、パラメーターセット、パイプライン、エラー経路、内部ロジックを検証する。外部依存は `Mock` などで分離する。

内部関数を検証する場合は、`InModuleScope` などを使用してビルド済みモジュールのスコープ内から検証する。

### 20.2 Integration Test

ファイルシステム、レジストリ、サービス、Windows API、外部実行ファイル、外部モジュールとの連携を検証する。

### 20.3 Contract Test

Contract Test では、ビルド済みマニフェストと公開関数の Help を検証する。

| 項目 | 検証 |
| --- | --- |
| マニフェスト | ビルド済みの `output/<ModuleName>/<ModuleName>.psd1` に対して `Test-ModuleManifest` を実行し、成功することを確認する。 |
| Help | すべての公開関数に必要な Help が存在する。 |

## 21. CI

GitHub Actionsを使用する場合は、Windowsランナーで `powershell.exe -ExecutionPolicy Bypass -File .\run.ps1 ci` を実行する。

`run.ps1` は処理をサブコマンド単位で実行できるようにする。引数を指定しない場合は、利用可能なサブコマンドと使用方法を表示する。

| サブコマンド | 処理 |
| --- | --- |
| `.\run.ps1 format` | `Invoke-Formatter` と `PSScriptFormatterSettings.psd1` を使用してソースを整形する。 |
| `.\run.ps1 analyze` | `Invoke-ScriptAnalyzer` と `PSScriptAnalyzerSettings.psd1` を使用して静的解析する。 |
| `.\run.ps1 build` | `src/<ModuleName>/build.psd1` を使用して ModuleBuilder の `Build-Module` を実行し、配布成果物を生成する。 |
| `.\run.ps1 test unit` | Unit Test を実行する。必要な配布成果物は先に生成する。 |
| `.\run.ps1 test integration` | Integration Test を実行する。必要な配布成果物は先に生成する。 |
| `.\run.ps1 test contract` | Contract Test を実行する。必要な配布成果物は先に生成する。 |
| `.\run.ps1 test all` | Unit Test、Integration Test、Contract Test を実行する。必要な配布成果物は先に生成する。 |
| `.\run.ps1 ci` | CI の一連の検証を実行する。 |

`.\run.ps1 ci` では次の順に検証する。

| 順序 | 処理 |
| --- | --- |
| 1 | ソースのファイル構成、エンコーディング、BOM、改行コード、ASCII-only、Windows PowerShell 5.1 パーサー、フォーマット、静的解析を検査する。 |
| 2 | `.\run.ps1 build` と同じ処理で `.psm1` を生成し、ソースマニフェストを配布先の `.psd1` へコピーして必要な項目を更新する。配布する `.ps1`、`.psm1`、`.psd1`、`.ps1xml` をUTF-8（BOMなし）かつLFへ変換する。 |
| 3 | 生成物を Windows PowerShell 5.1 のパーサーで検査し、エンコーディング、BOM、改行コード、ASCII-only、マニフェストを検査する。マニフェストが参照するファイルがすべて存在することを確認し、新しい Windows PowerShell 5.1 プロセスで `output/<ModuleName>/<ModuleName>.psd1` をインポートする。 |
| 4 | `.\run.ps1 test all` と同じテストを実行する。 |
| 5 | `output/<ModuleName>/<ModuleName>.psd1` と `output/<ModuleName>/<ModuleName>.psm1` の存在を確認する。検査対象は実際の配布構成から取得し、`data/`、`formats/`、`types/` の実行時ファイルを含める。 |

---

## 22. PowerShell Gallery

PowerShell Galleryは、モジュールを検索、取得、公開するリポジトリとして使用する。各操作には `Microsoft.PowerShell.PSResourceGet` を使用する。

### 22.1 検索

モジュールを検索する場合は `Find-PSResource` を使用する。

```powershell
Find-PSResource -Name 'ModuleName' -Repository PSGallery
```

### 22.2 インストール

モジュールをインストールする場合は `Install-PSResource` を使用する。

```powershell
Install-PSResource -Name 'ModuleName' -Scope CurrentUser -Repository PSGallery
```

### 22.3 公開

ビルド済みの `output/<ModuleName>/` を公開対象にする。

```powershell
$apiKey = '<ApiKey>'

Publish-PSResource -Path './output/<ModuleName>' -ApiKey $apiKey -Repository PSGallery
```

---

## 参考資料

| 本書の章 | 参考資料 |
| --- | --- |
| 1. 環境<br>4. モジュールマニフェスト | [about_PowerShell_Editions - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_editions?view=powershell-5.1) |
| 1. 環境<br>17. 自動フォーマット<br>19. 静的解析<br>21. CI | [PSScriptAnalyzer module - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/utility-modules/psscriptanalyzer/overview?view=ps-modules) |
| 1. 環境<br>20. テスト<br>21. CI | [Quick Start \| Pester](https://pester.dev/docs/v5/quick-start) |
| 1. 環境<br>2. リポジトリ構成<br>5. ビルド | [ModuleBuilder](https://github.com/PoshCode/ModuleBuilder) |
| 3. ソースファイル<br>12. 外部実行ファイル<br>13. ファイル | [about_Character_Encoding - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding?view=powershell-5.1) |
| 4. モジュールマニフェスト<br>22. PowerShell Gallery | [about_Module_Manifests - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_module_manifests?view=powershell-5.1) |
| 4. モジュールマニフェスト | [New-ModuleManifest (Microsoft.PowerShell.Core) - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/new-modulemanifest?view=powershell-5.1) |
| 6. 命名 | [Get-Verb (Microsoft.PowerShell.Core) - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/get-verb?view=powershell-5.1) |
| 6. 命名 | [Strongly Encouraged Development Guidelines - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/strongly-encouraged-development-guidelines?view=powershell-5.1) |
| 7. 関数<br>8. パイプライン | [about_Functions_Advanced_Parameters - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_advanced_parameters?view=powershell-5.1) |
| 7. 関数 | [about_Functions_Advanced - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_advanced?view=powershell-5.1) |
| 7. 関数 | [about_Functions_OutputTypeAttribute - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_functions_outputtypeattribute?view=powershell-5.1) |
| 7. 関数<br>9. 出力 | [Everything you wanted to know about PSCustomObject - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-pscustomobject?view=powershell-5.1) |
| 8. パイプライン<br>9. 出力 | [about_Pipelines - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-gb/powershell/module/microsoft.powershell.core/about/about_pipelines?view=powershell-5.1) |
| 9. 出力<br>10. エラー処理 | [about_Output_Streams - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_output_streams?view=powershell-5.1) |
| 9. 出力 | [about_Return - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_return?view=powershell-5.1) |
| 9. 出力 | [about_Format.ps1xml - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-sg/powershell/module/microsoft.powershell.core/about/about_format.ps1xml?view=powershell-5.1) |
| 10. エラー処理 | [about_Error_Handling - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_error_handling?view=powershell-5.1) |
| 11. 状態変更 | [Everything you wanted to know about ShouldProcess - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-shouldprocess?view=powershell-5.1) |
| 12. 外部実行ファイル | [about_Automatic_Variables - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_automatic_variables?view=powershell-5.1) |
| 12. 外部実行ファイル | [about_Preference_Variables - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_preference_variables?view=powershell-5.1) |
| 13. ファイル | [about_Path_Syntax - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-gb/powershell/module/microsoft.powershell.core/about/about_path_syntax?view=powershell-5.1) |
| 14. 通信 | [Invoke-RestMethod (Microsoft.PowerShell.Utility) - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/Microsoft.PowerShell.Utility/invoke-restmethod?view=powershell-5.1) |
| 14. 通信 | [Invoke-WebRequest (Microsoft.PowerShell.Utility) - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest?view=powershell-5.1) |
| 14. 通信 | [HttpClient Class (System.Net.Http) \| Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient?view=netframework-4.8.1) |
| 14. 通信 | [HttpCompletionOption Enum (System.Net.Http) \| Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpcompletionoption?view=netframework-4.8.1) |
| 14. 通信 | [Transport Layer Security (TLS) best practices with .NET Framework \| Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/framework/network-programming/tls) |
| 14. 通信 | [AngleSharp](https://github.com/AngleSharp/AngleSharp) |
| 15. コードスタイル | [about_Scopes - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_scopes?view=powershell-5.1) |
| 15. コードスタイル | [about_Splatting - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_splatting?view=powershell-5.1) |
| 15. コードスタイル | [about_Comparison_Operators - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_comparison_operators?view=powershell-5.1) |
| 16. ヘルプ | [about_Comment_Based_Help - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_comment_based_help?view=powershell-5.1) |
| 17. 自動フォーマット | [Invoke-Formatter (PSScriptAnalyzer) - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/psscriptanalyzer/invoke-formatter?view=ps-modules) |
| 19. 静的解析 | [Invoke-ScriptAnalyzer (PSScriptAnalyzer) - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/psscriptanalyzer/invoke-scriptanalyzer?view=ps-modules) |
| 4. モジュールマニフェスト<br>19. 静的解析 | [PSScriptAnalyzer rules and recommendations - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/utility-modules/psscriptanalyzer/rules-recommendations?view=ps-modules) |
| 20. テスト | [Unit Testing within Modules \| Pester](https://pester.dev/docs/usage/modules/) |
| 21. CI | [Workflow syntax for GitHub Actions - GitHub Docs](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) |
| 1. 環境 | [Install a package manager for PowerShell - PowerShell \| Microsoft Learn](https://learn.microsoft.com/powershell/gallery/powershellget/update-powershell-51) |
| 1. 環境<br>22. PowerShell Gallery | [Microsoft.PowerShell.PSResourceGet Module - PowerShell \| Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.psresourceget/?view=powershellget-3.x) |
