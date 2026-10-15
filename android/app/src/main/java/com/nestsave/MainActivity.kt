package com.nestsave

import android.os.Bundle
import android.widget.Toast
import androidx.activity.compose.setContent
import androidx.biometric.BiometricPrompt
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingDown
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.nestsave.domain.calculations.FinancialCalculations
import com.nestsave.domain.models.Goal
import com.nestsave.domain.models.GoalStatus
import com.nestsave.domain.models.GoalType
import com.nestsave.domain.models.Priority
import com.nestsave.domain.updater.UpdateCheckResult
import com.nestsave.domain.updater.UpdateManager
import com.nestsave.domain.updater.VersionInfo
import com.nestsave.ui.theme.*
import kotlinx.coroutines.launch

class MainActivity : FragmentActivity() {
    private var isAppLockEnabled by mutableStateOf(false)
    private var isVaultUnlocked by mutableStateOf(true)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NestSaveTheme {
                if (isAppLockEnabled && !isVaultUnlocked) {
                    BiometricLockScreen(
                        onUnlock = { isVaultUnlocked = true },
                        onRequestBiometric = { promptBiometrics { isVaultUnlocked = true } }
                    )
                } else {
                    NestSaveMainScreen(
                        isLockEnabled = isAppLockEnabled,
                        onToggleLock = { enabled ->
                            if (enabled) {
                                promptBiometrics {
                                    isAppLockEnabled = true
                                    Toast.makeText(this, "Biometric App Lock Enabled", Toast.LENGTH_SHORT).show()
                                }
                            } else {
                                isAppLockEnabled = false
                                Toast.makeText(this, "App Lock Disabled", Toast.LENGTH_SHORT).show()
                            }
                        },
                        onLockVault = {
                            if (isAppLockEnabled) {
                                isVaultUnlocked = false
                            } else {
                                Toast.makeText(this, "Enable Biometric Lock in Settings first", Toast.LENGTH_SHORT).show()
                            }
                        }
                    )
                }
            }
        }
    }

    private fun promptBiometrics(onSuccess: () -> Unit) {
        val executor = ContextCompat.getMainExecutor(this)
        val biometricPrompt = BiometricPrompt(
            this,
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    onSuccess()
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                }
            }
        )

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("NestSave Biometric Vault")
            .setSubtitle("Verify fingerprint or face to access offline financial data")
            .setNegativeButtonText("Cancel")
            .build()

        biometricPrompt.authenticate(promptInfo)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NestSaveMainScreen(
    isLockEnabled: Boolean = false,
    onToggleLock: (Boolean) -> Unit = {},
    onLockVault: () -> Unit = {}
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var showRDModal by remember { mutableStateOf(false) }
    var showSalaryDayModal by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()
    var updateResult by remember { mutableStateOf<UpdateCheckResult?>(null) }
    var isCheckingUpdate by remember { mutableStateOf(false) }
    var isUpdateBannerDismissed by remember { mutableStateOf(false) }
    var showUpdateDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        isCheckingUpdate = true
        updateResult = UpdateManager.checkForUpdates()
        isCheckingUpdate = false
    }

    val onCheckForUpdates: () -> Unit = {
        coroutineScope.launch {
            isCheckingUpdate = true
            updateResult = UpdateManager.checkForUpdates()
            isCheckingUpdate = false
        }
    }

    // Active goals in state
    val goals = remember {
        mutableStateListOf(
            Goal(
                id = "1",
                name = "Emergency Buffer (6 Mo)",
                type = GoalType.EMERGENCY,
                category = "Emergency",
                targetAmount = 150000.0,
                currentAmount = 95000.0,
                startDate = "2026-01-01",
                targetDate = "2026-12-31",
                priority = Priority.CRITICAL,
                status = GoalStatus.ACTIVE,
                note = "6 months non-negotiable living expenses",
                createdAt = "2026-01-01T00:00:00Z",
                updatedAt = "2026-01-01T00:00:00Z"
            ),
            Goal(
                id = "2",
                name = "MacBook Pro M3 Max",
                type = GoalType.PURCHASE,
                category = "Technology",
                targetAmount = 140000.0,
                currentAmount = 65000.0,
                startDate = "2026-02-01",
                targetDate = "2026-08-31",
                priority = Priority.HIGH,
                status = GoalStatus.ACTIVE,
                note = "Workstation upgrade",
                createdAt = "2026-02-01T00:00:00Z",
                updatedAt = "2026-02-01T00:00:00Z"
            ),
            Goal(
                id = "3",
                name = "Vehicle Down Payment",
                type = GoalType.PURCHASE,
                category = "Vehicle",
                targetAmount = 200000.0,
                currentAmount = 75000.0,
                startDate = "2026-01-15",
                targetDate = "2027-03-31",
                priority = Priority.MEDIUM,
                status = GoalStatus.ACTIVE,
                note = "Car down payment",
                createdAt = "2026-01-15T00:00:00Z",
                updatedAt = "2026-01-15T00:00:00Z"
            )
        )
    }

    val totalSaved = goals.sumOf { it.currentAmount }
    val totalTarget = goals.sumOf { it.targetAmount }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        NestSaveLogoIcon(size = 32.dp)
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "NestSave",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 18.sp,
                                    color = MaterialTheme.colorScheme.onBackground
                                )
                                Text(
                                    text = "🔥 7d",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFF97316),
                                    modifier = Modifier
                                        .background(Color(0x26F97316), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 4.dp, vertical = 1.dp)
                                )
                            }
                            Text(
                                text = "Zero Cloud Savings Planner",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { showRDModal = true }) {
                        Icon(
                            imageVector = Icons.Default.Calculate,
                            contentDescription = "RD/FD Calculators",
                            tint = NestEmeraldLight
                        )
                    }
                    IconButton(onClick = { showSalaryDayModal = true }) {
                        Icon(
                            imageVector = Icons.Default.AccountBalanceWallet,
                            contentDescription = "Salary Day Batch Deposit",
                            tint = NestEmeraldLight
                        )
                    }
                    IconButton(onClick = onLockVault) {
                        Icon(
                            imageVector = if (isLockEnabled) Icons.Default.Lock else Icons.Default.LockOpen,
                            contentDescription = "Lock Vault",
                            tint = if (isLockEnabled) NestEmeraldLight else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                val tabs = listOf(
                    "Home" to Icons.Default.Home,
                    "Analytics" to Icons.Default.BarChart,
                    "Expenses" to Icons.AutoMirrored.Filled.TrendingDown,
                    "Badges" to Icons.Default.EmojiEvents,
                    "Settings" to Icons.Default.Settings
                )
                tabs.forEachIndexed { index, (label, icon) ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = NestEmeraldLight,
                            selectedTextColor = NestEmeraldLight,
                            indicatorColor = DarkCard
                        )
                    )
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        when (selectedTab) {
            0 -> HomeScreen(
                paddingValues = paddingValues,
                goals = goals,
                totalSaved = totalSaved,
                totalTarget = totalTarget,
                updateResult = updateResult,
                isUpdateBannerDismissed = isUpdateBannerDismissed,
                onDismissUpdateBanner = { isUpdateBannerDismissed = true },
                onOpenUpdateDialog = { showUpdateDialog = true },
                onOpenRD = { showRDModal = true },
                onOpenSalaryDay = { showSalaryDayModal = true }
            )
            1 -> AnalyticsScreen(
                paddingValues = paddingValues,
                goals = goals,
                totalSaved = totalSaved,
                totalTarget = totalTarget
            )
            2 -> ExpensesScreen(
                paddingValues = paddingValues
            )
            3 -> BadgesScreen(
                paddingValues = paddingValues
            )
            4 -> SettingsScreen(
                paddingValues = paddingValues,
                isLockEnabled = isLockEnabled,
                onToggleLock = onToggleLock,
                updateResult = updateResult,
                isCheckingUpdate = isCheckingUpdate,
                onCheckForUpdates = onCheckForUpdates,
                onOpenUpdateDialog = { showUpdateDialog = true }
            )
        }
    }

    if (showRDModal) {
        RDCalculatorDialog(onDismiss = { showRDModal = false })
    }

    if (showSalaryDayModal) {
        SalaryDayBatchDialog(goals = goals, onDismiss = { showSalaryDayModal = false })
    }

    if (showUpdateDialog && updateResult != null) {
        UpdateDialog(result = updateResult!!, onDismiss = { showUpdateDialog = false })
    }
}

// ==============================================================
// TAB 0: HOME SCREEN
// ==============================================================
@Composable
fun HomeScreen(
    paddingValues: PaddingValues,
    goals: List<Goal>,
    totalSaved: Double,
    totalTarget: Double,
    updateResult: UpdateCheckResult? = null,
    isUpdateBannerDismissed: Boolean = false,
    onDismissUpdateBanner: () -> Unit = {},
    onOpenUpdateDialog: () -> Unit = {},
    onOpenRD: () -> Unit,
    onOpenSalaryDay: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        if (updateResult?.isUpdateAvailable == true && !isUpdateBannerDismissed) {
            item {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF064E3B)),
                    border = BorderStroke(1.dp, NestEmeraldLight),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("🚀", fontSize = 22.sp)
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Update Available: v${updateResult.latestVersion?.versionName ?: "1.0.1"}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = Color.White
                            )
                            Text(
                                text = updateResult.latestVersion?.title ?: "Tap to download the latest update",
                                fontSize = 11.sp,
                                color = Color(0xFFA7F3D0)
                            )
                        }
                        Button(
                            onClick = onOpenUpdateDialog,
                            colors = ButtonDefaults.buttonColors(containerColor = NestEmeraldLight),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("Update", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF022C22))
                        }
                        IconButton(
                            onClick = onDismissUpdateBanner,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Dismiss", tint = Color(0xFFA7F3D0), modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard(
                    title = "Total Saved",
                    value = FinancialCalculations.formatINR(totalSaved),
                    subtitle = "${if (totalTarget > 0) ((totalSaved / totalTarget) * 100).toInt() else 0}% of target",
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Target Corpus",
                    value = FinancialCalculations.formatINR(totalTarget),
                    subtitle = "${goals.size} Active Goals",
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onOpenRD,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = NestEmerald),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Calculate, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Bank RD & FD", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onOpenSalaryDay,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = DarkCard),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.AccountBalanceWallet, contentDescription = null, modifier = Modifier.size(16.dp), tint = NestEmeraldLight)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Salary Day", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }
        }

        item {
            Text(
                text = "Active Goals",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onBackground
            )
        }

        items(goals) { goal ->
            GoalCardItem(goal = goal)
        }
    }
}

// ==============================================================
// TAB 1: ANALYTICS SCREEN
// ==============================================================
@Composable
fun AnalyticsScreen(
    paddingValues: PaddingValues,
    goals: List<Goal>,
    totalSaved: Double,
    totalTarget: Double
) {
    val completionPct = if (totalTarget > 0) ((totalSaved / totalTarget) * 100).toInt() else 0

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Portfolio Analytics", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color.White)
            Text("Visual wealth trajectory & priority distribution", fontSize = 12.sp, color = TextDarkSecondary)
        }

        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = DarkCard),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("PORTFOLIO COMPLETION", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextDarkSecondary)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        Text("$completionPct%", fontSize = 32.sp, fontWeight = FontWeight.Black, color = NestEmeraldLight)
                        Text("${FinancialCalculations.formatINR(totalSaved)} / ${FinancialCalculations.formatINR(totalTarget)}", fontSize = 13.sp, color = Color.White)
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    LinearProgressIndicator(
                        progress = { completionPct / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = NestEmeraldLight,
                        trackColor = Color(0xFF27272A),
                    )
                }
            }
        }

        item {
            Text("Priority Breakdown", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
        }

        items(goals) { goal ->
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(goal.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.White)
                        Text("Priority: ${goal.priority.name}", fontSize = 11.sp, color = NestEmeraldLight)
                    }
                    Text(
                        FinancialCalculations.formatINR(goal.currentAmount),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.White
                    )
                }
            }
        }
    }
}

// ==============================================================
// TAB 2: EXPENSES SCREEN
// ==============================================================
@Composable
fun ExpensesScreen(paddingValues: PaddingValues) {
    val totalBudget = 35000.0
    val totalSpent = 19200.0
    val remaining = totalBudget - totalSpent
    val pctUsed = ((totalSpent / totalBudget) * 100).toInt()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Monthly Budget & Expenses", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color.White)
            Text("Keep expenses low to maximize savings capacity", fontSize = 12.sp, color = TextDarkSecondary)
        }

        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = DarkCard),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("MONTHLY BUDGET", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextDarkSecondary)
                            Text(FinancialCalculations.formatINR(totalBudget), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("REMAINING", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextDarkSecondary)
                            Text(FinancialCalculations.formatINR(remaining), fontSize = 18.sp, fontWeight = FontWeight.Black, color = NestEmeraldLight)
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    LinearProgressIndicator(
                        progress = { pctUsed / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = if (pctUsed > 85) Color(0xFFEF4444) else NestEmeraldLight,
                        trackColor = Color(0xFF27272A),
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("$pctUsed% of monthly limit spent", fontSize = 11.sp, color = TextDarkSecondary)
                }
            }
        }

        item {
            Text("Logged Expenses", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
        }

        item {
            val sampleExpenses = listOf(
                "Groceries & Supermarket" to 4500.0,
                "Electricity & Wi-Fi Bills" to 2800.0,
                "Fuel & Transit" to 3200.0,
                "Dining Out & Coffee" to 1900.0,
                "Home Maintenance" to 6800.0
            )
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                sampleExpenses.forEach { (category, amount) ->
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(category, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = Color.White)
                            Text(FinancialCalculations.formatINR(amount), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF87171))
                        }
                    }
                }
            }
        }
    }
}

// ==============================================================
// TAB 3: BADGES SCREEN
// ==============================================================
@Composable
fun BadgesScreen(paddingValues: PaddingValues) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Streaks & Badges", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color.White)
            Text("Habit momentum and savings milestones", fontSize = 12.sp, color = TextDarkSecondary)
        }

        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = DarkCard),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text("🔥", fontSize = 40.sp)
                    Column {
                        Text("7-Day Active Streak!", fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text("Longest streak: 14 days • 24 total deposits logged", fontSize = 11.sp, color = TextDarkSecondary)
                    }
                }
            }
        }

        item {
            Text("Unlocked Badges", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
        }

        val badges = listOf(
            Triple("🌟", "First Deposit", "Logged your first savings deposit"),
            Triple("🔥", "Week Flame", "Maintained a 7-day streak"),
            Triple("💎", "Halfway Titan", "Crossed 50% on any active goal"),
            Triple("⚡", "Recalibrator", "Recalibrated a plan to stay on track")
        )

        items(badges) { (emoji, title, desc) ->
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(emoji, fontSize = 24.sp)
                    Column {
                        Text(title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.White)
                        Text(desc, fontSize = 11.sp, color = TextDarkSecondary)
                    }
                }
            }
        }
    }
}

// ==============================================================
// TAB 4: SETTINGS SCREEN
// ==============================================================
@Composable
fun SettingsScreen(
    paddingValues: PaddingValues,
    isLockEnabled: Boolean,
    onToggleLock: (Boolean) -> Unit,
    updateResult: UpdateCheckResult? = null,
    isCheckingUpdate: Boolean = false,
    onCheckForUpdates: () -> Unit = {},
    onOpenUpdateDialog: () -> Unit = {}
) {
    val context = LocalContext.current

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Settings & Security", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color.White)
            Text("Local vault security and application preferences", fontSize = 12.sp, color = TextDarkSecondary)
        }

        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkCard),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("HARDWARE SECURITY", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextDarkSecondary)
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Biometric Fingerprint Lock", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.White)
                            Text("Require authentication on launch", fontSize = 11.sp, color = TextDarkSecondary)
                        }
                        Switch(
                            checked = isLockEnabled,
                            onCheckedChange = onToggleLock,
                            colors = SwitchDefaults.colors(checkedThumbColor = NestEmeraldLight, checkedTrackColor = NestEmeraldDark)
                        )
                    }
                }
            }
        }

        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkCard),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("OFFLINE STORAGE & BACKUP", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextDarkSecondary)

                    Button(
                        onClick = {
                            Toast.makeText(context, "Encrypted backup exported to Downloads", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.FileDownload, contentDescription = null, modifier = Modifier.size(16.dp), tint = NestEmeraldLight)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Export Password-Encrypted Vault", fontSize = 12.sp, color = Color.White)
                    }

                    Button(
                        onClick = {
                            Toast.makeText(context, "Select encrypted .json backup file", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.FileUpload, contentDescription = null, modifier = Modifier.size(16.dp), tint = NestEmeraldLight)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Restore Encrypted Vault", fontSize = 12.sp, color = Color.White)
                    }
                }
            }
        }

        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkCard),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("APP UPDATES & RELEASES", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextDarkSecondary)
                        Text("Installed: v${BuildConfig.VERSION_NAME}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NestEmeraldLight)
                    }

                    if (updateResult?.isUpdateAvailable == true) {
                        val latest = updateResult.latestVersion
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF064E3B)),
                            border = BorderStroke(1.dp, NestEmeraldLight),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text("🚀", fontSize = 20.sp)
                                    Column {
                                        Text("Update Available: v${latest?.versionName ?: ""}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.White)
                                        Text("Released ${latest?.releaseDate ?: "Recently"}", fontSize = 10.sp, color = Color(0xFFA7F3D0))
                                    }
                                }
                                if (!latest?.title.isNullOrEmpty()) {
                                    Text(latest?.title ?: "", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                                }
                                latest?.changelog?.forEach { note ->
                                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Text("•", color = NestEmeraldLight, fontSize = 12.sp)
                                        Text(note, fontSize = 11.sp, color = Color.White)
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Button(
                                    onClick = {
                                        UpdateManager.openUpdateDownload(context, latest?.apkUrl ?: "https://nestsave.vercel.app/download")
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = NestEmeraldLight),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color(0xFF022C22))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Download & Install Latest APK", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF022C22))
                                }
                            }
                        }
                    } else if (updateResult?.error != null) {
                        Text(
                            text = updateResult.error ?: "Unable to check for updates",
                            fontSize = 11.sp,
                            color = Color(0xFFF87171)
                        )
                    } else if (updateResult != null) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = NestEmeraldLight, modifier = Modifier.size(16.dp))
                            Text("You are using the latest version of NestSave ✓", fontSize = 12.sp, color = Color(0xFFA7F3D0))
                        }
                    }

                    Button(
                        onClick = onCheckForUpdates,
                        enabled = !isCheckingUpdate,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (isCheckingUpdate) {
                            CircularProgressIndicator(modifier = Modifier.size(16.dp), color = NestEmeraldLight, strokeWidth = 2.dp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Checking for updates...", fontSize = 12.sp, color = Color.White)
                        } else {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp), tint = NestEmeraldLight)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Check for Updates Now", fontSize = 12.sp, color = Color.White)
                        }
                    }
                }
            }
        }

        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkCard),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("ABOUT NESTSAVE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextDarkSecondary)
                    Text("NestSave Native Android v${BuildConfig.VERSION_NAME} (Build ${BuildConfig.VERSION_CODE})", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                    Text("Package: com.nestsave • 16 KB Page Aligned Linux ELF", fontSize = 11.sp, color = TextDarkSecondary)
                    Text("100% Offline-First Room SQLite Database • Zero Cloud Tracking", fontSize = 11.sp, color = NestEmeraldLight)
                }
            }
        }
    }
}

// ==============================================================
// UPDATE MODAL DIALOG
// ==============================================================
@Composable
fun UpdateDialog(
    result: UpdateCheckResult,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val latest = result.latestVersion ?: return

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("🚀", fontSize = 24.sp)
                Column {
                    Text("New Update Available!", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
                    Text("v${BuildConfig.VERSION_NAME} → v${latest.versionName}", fontSize = 12.sp, color = NestEmeraldLight, fontWeight = FontWeight.SemiBold)
                }
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                if (latest.title.isNotEmpty()) {
                    Text(latest.title, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = Color.White)
                }
                Text("What's New in this release:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextDarkSecondary)
                latest.changelog.forEach { note ->
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text("•", color = NestEmeraldLight, fontSize = 12.sp)
                        Text(note, fontSize = 12.sp, color = Color.White)
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    "This update includes the latest security patches, biometric improvements, and financial engine enhancements.",
                    fontSize = 11.sp,
                    color = TextDarkSecondary
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onDismiss()
                    UpdateManager.openUpdateDownload(context, latest.apkUrl)
                },
                colors = ButtonDefaults.buttonColors(containerColor = NestEmerald)
            ) {
                Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Download & Install", fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Later", color = TextDarkSecondary)
            }
        },
        containerColor = DarkCard,
        shape = RoundedCornerShape(16.dp)
    )
}

// ==============================================================
// BIOMETRIC LOCK SCREEN OVERLAY
// ==============================================================
@Composable
fun BiometricLockScreen(
    onUnlock: () -> Unit,
    onRequestBiometric: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF000000)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(20.dp),
            modifier = Modifier.padding(24.dp)
        ) {
            NestSaveLogoIcon(size = 80.dp)
            Text(
                text = "NestSave Vault Locked",
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
            )
            Text(
                text = "Verify your biometric identity to access your private offline financial roadmap.",
                fontSize = 12.sp,
                color = TextDarkSecondary,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
            Button(
                onClick = onRequestBiometric,
                colors = ButtonDefaults.buttonColors(containerColor = NestEmerald),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Icon(Icons.Default.Fingerprint, contentDescription = null, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Unlock with Fingerprint / Face", fontWeight = FontWeight.Bold)
            }
        }
    }
}

// ==============================================================
// METRIC CARD COMPONENT
// ==============================================================
@Composable
fun MetricCard(title: String, value: String, subtitle: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = title.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Black, color = NestEmeraldLight)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

// ==============================================================
// GOAL CARD COMPONENT
// ==============================================================
@Composable
fun GoalCardItem(goal: Goal) {
    val pct = if (goal.targetAmount > 0) ((goal.currentAmount / goal.targetAmount) * 100).toInt() else 0
    val pace = FinancialCalculations.aheadBehindSchedule(goal.targetAmount, goal.currentAmount, goal.startDate, goal.targetDate)
    val reqMonth = FinancialCalculations.requiredMonthly(goal.targetAmount, goal.currentAmount, goal.targetDate)

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = goal.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color.White)
                    Text(text = "${goal.category} • ${goal.priority} Priority", fontSize = 11.sp, color = TextDarkSecondary)
                }
                Text(
                    text = FinancialCalculations.formatINR(goal.currentAmount),
                    fontWeight = FontWeight.Black,
                    fontSize = 16.sp,
                    color = NestEmeraldLight
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            LinearProgressIndicator(
                progress = { pct / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = if (pace.status == "behind") Color(0xFFF59E0B) else NestEmeraldLight,
                trackColor = Color(0xFF27272A),
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Goal: ${FinancialCalculations.formatINR(goal.targetAmount)} ($pct%)",
                    fontSize = 11.sp,
                    color = TextDarkSecondary
                )
                Text(
                    text = "${FinancialCalculations.formatINR(reqMonth)}/mo needed",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (pace.status == "behind") Color(0xFFF59E0B) else NestEmeraldLight
                )
            }

            if (pace.status == "behind") {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0x1AF59E0B), RoundedCornerShape(8.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Behind schedule (${pace.label})",
                        fontSize = 11.sp,
                        color = Color(0xFFF59E0B),
                        fontWeight = FontWeight.Medium
                    )
                    Text(
                        text = "Recalibrate Plan ⚡",
                        fontSize = 10.sp,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .background(Color(0xFFB45309), RoundedCornerShape(6.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }
        }
    }
}

// ==============================================================
// RD & FD CALCULATOR DIALOG
// ==============================================================
@Composable
fun RDCalculatorDialog(onDismiss: () -> Unit) {
    var monthlyDeposit by remember { mutableStateOf("5000") }
    var interestRate by remember { mutableStateOf("7.1") }
    var tenureMonths by remember { mutableStateOf("12") }

    val p = monthlyDeposit.toDoubleOrNull() ?: 0.0
    val r = interestRate.toDoubleOrNull() ?: 0.0
    val m = tenureMonths.toIntOrNull() ?: 0
    val rdResult = FinancialCalculations.calculateRD(p, r, m)

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = NestEmerald)
            ) {
                Text("Done")
            }
        },
        title = {
            Text("Bank RD & FD Calculator", fontWeight = FontWeight.Bold)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Quarterly Compounding Formula (Indian Banking Standard)", fontSize = 11.sp, color = TextDarkSecondary)

                OutlinedTextField(
                    value = monthlyDeposit,
                    onValueChange = { monthlyDeposit = it },
                    label = { Text("Monthly Deposit (₹)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = interestRate,
                    onValueChange = { interestRate = it },
                    label = { Text("Annual Interest Rate (%)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = tenureMonths,
                    onValueChange = { tenureMonths = it },
                    label = { Text("Tenure (Months)") },
                    modifier = Modifier.fillMaxWidth()
                )

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DarkCard)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Total Invested: ${FinancialCalculations.formatINR(rdResult.totalInvested)}", fontSize = 12.sp, color = Color.White)
                        Text("Interest Earned: ${FinancialCalculations.formatINR(rdResult.totalInterestEarned)}", fontSize = 12.sp, color = NestEmeraldLight, fontWeight = FontWeight.Bold)
                        Text("Maturity Value: ${FinancialCalculations.formatINR(rdResult.maturityAmount)}", fontSize = 14.sp, color = Color.White, fontWeight = FontWeight.Black)
                    }
                }
            }
        },
        containerColor = DarkSurface
    )
}

// ==============================================================
// SALARY DAY BATCH DEPOSIT DIALOG
// ==============================================================
@Composable
fun SalaryDayBatchDialog(goals: List<Goal>, onDismiss: () -> Unit) {
    val totalRequired = goals.sumOf { FinancialCalculations.requiredMonthly(it.targetAmount, it.currentAmount, it.targetDate) }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = NestEmerald)
            ) {
                Text("Allocate All (${FinancialCalculations.formatINR(totalRequired)})")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextDarkSecondary)
            }
        },
        title = {
            Text("Salary Day Batch Allocator", fontWeight = FontWeight.Bold)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("1-Tap allocation across all active goals for this month's payday.", fontSize = 12.sp, color = TextDarkSecondary)
                goals.forEach { goal ->
                    val needed = FinancialCalculations.requiredMonthly(goal.targetAmount, goal.currentAmount, goal.targetDate)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(goal.name, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text(FinancialCalculations.formatINR(needed), fontSize = 13.sp, color = NestEmeraldLight)
                    }
                }
            }
        },
        containerColor = DarkSurface
    )
}

// ==============================================================
// BRAND LOGO ICON COMPOSABLE
// ==============================================================
@Composable
fun NestSaveLogoIcon(modifier: Modifier = Modifier, size: Dp = 32.dp) {
    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(size * 0.28f))
            .background(Color(0xFF0D684C)),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(this.size.width / 2f, this.size.height / 2f)
            drawCircle(
                color = Color.White,
                radius = this.size.width * 0.265f,
                center = center,
                style = Stroke(width = this.size.width * 0.055f)
            )
            drawCircle(
                color = Color.White,
                radius = this.size.width * 0.165f,
                center = center,
                style = Stroke(width = this.size.width * 0.05f)
            )
            drawCircle(
                color = Color.White,
                radius = this.size.width * 0.07f,
                center = center,
                style = Stroke(width = this.size.width * 0.045f)
            )
        }
    }
}
