plugins {
    application
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.guava)
    implementation("io.github.cdimascio:dotenv-java:3.0.0")
    implementation("com.slack.api:bolt:1.1.+")
    implementation("com.slack.api:bolt-servlet:1.1.+")
    implementation("com.slack.api:bolt-jetty:1.1.+")
    implementation("ch.qos.logback:logback-classic:1.5.8")
    testImplementation("org.hamcrest:hamcrest:3.0")
}

testing {
    suites {
        val test by getting(JvmTestSuite::class) {
            useJUnitJupiter("5.10.3")
        }
    }
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

application {
    mainClass = "com.ggalmazor.Picky"
}
