import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.tamvakti.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.tamvakti.app"
        minSdk = 24
        targetSdk = 36
        
        // Sürüm Yapılandırması: v2.4 "Şafak"
        versionCode = 20600
        versionName = "2.6"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    // İki dağıtım: "github" (APK, uygulama içi güncelleme var) ve "play" (AAB, kendini güncelleme yok)
    flavorDimensions += "dist"
    productFlavors {
        create("github") {
            dimension = "dist"
            buildConfigField("boolean", "IS_PLAY", "false")
        }
        create("play") {
            dimension = "dist"
            buildConfigField("boolean", "IS_PLAY", "true")
        }
    }

    buildFeatures {
        buildConfig = true
    }

    // İmza bilgileri ASLA depoda tutulmaz. Kaynaklar (öncelik sırasıyla):
    //  1) Ortam değişkenleri (GitHub Actions Secrets): TAMVAKTI_KEYSTORE_FILE,
    //     TAMVAKTI_KEYSTORE_PASSWORD, TAMVAKTI_KEY_ALIAS, TAMVAKTI_KEY_PASSWORD
    //  2) android/keystore.properties (git'e eklenmez): storeFile, storePassword, keyAlias, keyPassword
    val keystoreProps = Properties().apply {
        val f = rootProject.file("keystore.properties")
        if (f.exists()) f.inputStream().use { load(it) }
    }
    fun signingValue(env: String, prop: String): String? =
        System.getenv(env)?.takeIf { it.isNotBlank() } ?: keystoreProps.getProperty(prop)

    val releaseStoreFile = signingValue("TAMVAKTI_KEYSTORE_FILE", "storeFile")

    signingConfigs {
        if (releaseStoreFile != null) {
            create("release") {
                storeFile = file(releaseStoreFile)
                storePassword = signingValue("TAMVAKTI_KEYSTORE_PASSWORD", "storePassword")
                keyAlias = signingValue("TAMVAKTI_KEY_ALIAS", "keyAlias")
                keyPassword = signingValue("TAMVAKTI_KEY_PASSWORD", "keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Anahtar yoksa derleme kırılmasın diye debug imzası; bu APK dağıtılmamalı
            signingConfig = signingConfigs.findByName("release") ?: signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.webkit:webkit:1.12.1")
}
