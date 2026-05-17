@echo off
setlocal enabledelayedexpansion

REM 设置公司信息
set "company_name=卖家互助团"
set "wechat_id=Amzssa-66"
set "phone_number=手机号：17304053906"

REM 获取路径
set "path_file=image_paths.txt"
set "asin_file=asin_list.txt"

REM 检查输入文件是否存在
if not exist "%path_file%" (
    echo Path file not found: %path_file%
    pause
    exit /b
)

if not exist "%asin_file%" (
    echo ASIN file not found: %asin_file%
    pause
    exit /b
)

REM 读取路径
set "source_image="
set "target_folder="
set count=0

REM 读取源图片路径和目标文件夹路径
for /f "usebackq delims=" %%A in ("%path_file%") do (
    if !count! equ 0 (
        set "source_image=%%A"
    ) else (
        set "target_folder=%%A"
    )
    set /a count+=1
)

REM 输出路径信息
echo Source Image: !source_image!
echo Target Folder: !target_folder!

REM 检查源图片是否存在
if not exist "!source_image!" (
    echo Source image not found. Please ensure the path is correct.
    pause
    exit /b
)

REM 创建目标文件夹（如果不存在）
if not exist "!target_folder!" (
    mkdir "!target_folder!"
)

REM 复制图片并重命名
set /a image_count=0
set /a group_count=1
set "group_folder=!target_folder!\group_!group_count!"

REM 创建初始分组文件夹
mkdir "!group_folder!"

for /f "usebackq delims=" %%C in ("%asin_file%") do (
    set "new_image_path=!group_folder!\%%C.jpg"
    copy "!source_image!" "!new_image_path!" >nul

    echo Copied to: !new_image_path!

    set /a image_count+=1

    REM 每200张图片创建一个新的ZIP文件
    if !image_count! geq 200 (
        REM 压缩当前组的图片
        powershell -command "Compress-Archive -Path '!group_folder!\*' -DestinationPath '!target_folder!\group_!group_count!.zip'"
        echo Created ZIP: !target_folder!\group_!group_count!.zip

        REM 重置计数器并创建新的分组文件夹
        set /a group_count+=1
        set /a image_count=0
        set "group_folder=!target_folder!\group_!group_count!"
        mkdir "!group_folder!"
    )
)

REM 压缩最后一组（如果有剩余的图片）
if !image_count! gtr 0 (
    powershell -command "Compress-Archive -Path '!group_folder!\*' -DestinationPath '!target_folder!\group_!group_count!.zip'"
    echo Created ZIP: !target_folder!\group_!group_count!.zip
)

echo Completed!
echo.
echo !company_name!
echo !wechat_id!
echo !phone_number!
echo 该程序仅供个人使用，禁止商业售卖，违者必究。
pause