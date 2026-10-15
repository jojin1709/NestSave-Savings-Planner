package com.nestsave

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nestsave.domain.calculations.FinancialCalculations
import com.nestsave.domain.models.Goal
import com.nestsave.domain.models.GoalStatus
import com.nestsave.domain.models.GoalType
import com.nestsave.domain.models.Priority
import com.nestsave.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NestSaveTheme {
                NestSaveMainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NestSaveMainScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    var showRDModal by remember { mutableStateOf(false) }
    var showSalaryDayModal by remember { mutableStateOf(false) }

    // Sample active goals in state (persisted via Room in production)
    val goals = remember {
        mutableStateListOf(
            Goal(
                id = "1",
                name = "Emergency Buffer",
                type = GoalType.EMERGENCY,
                category = "Emergency",
                targetAmount = 100000.0,
                currentAmount = 45000.0,
                startDate = "2026-01-01",
                targetDate = "2026-12-31",
                priority = Priority.CRITICAL,
                status = GoalStatus.ACTIVE,
                createdAt = "2026-01-01",
                updatedAt = "2026-01-01"
            )
        )
    }

    val totalSaved = goals.sumOf { it.currentAmount }
    val totalTarget = goals.sumOf { it.targetAmount }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "NestSave",
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            text = "Zero Cloud Savings Planner",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
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
                    IconButton(onClick = { /* Lock Vault */ }) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = "Lock Vault",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
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
                    "Expenses" to Icons.Default.TrendingDown,
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Metrics Row
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

            // Quick Banking Action Row
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { showRDModal = true },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = NestEmerald),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Calculate, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Bank RD & FD", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = { showSalaryDayModal = true },
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

            // Section Header
            item {
                Text(
                    text = "Active Goals",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            // Goals List
            items(goals) { goal ->
                GoalCardItem(goal = goal)
            }
        }
    }

    // RD Calculator Modal Dialog
    if (showRDModal) {
        RDCalculatorDialog(onDismiss = { showRDModal = false })
    }

    // Salary Day Batch Deposit Dialog
    if (showSalaryDayModal) {
        SalaryDayBatchDialog(goals = goals, onDismiss = { showSalaryDayModal = false })
    }
}

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

            // Progress bar
            LinearProgressIndicator(
                progress = { (pct / 100f).coerceIn(0f, 1f) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = NestEmeraldLight,
                trackColor = DarkSurface
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Needs ${FinancialCalculations.formatINR(reqMonth)}/mo", fontSize = 11.sp, color = TextDarkSecondary)
                Text(text = pace.label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (pace.status == "behind") AlertRose else NestEmeraldLight)
            }
        }
    }
}

@Composable
fun RDCalculatorDialog(onDismiss: () -> Unit) {
    var monthly by remember { mutableStateOf("5000") }
    var rate by remember { mutableStateOf("7.1") }
    var tenure by remember { mutableStateOf("12") }

    val rdResult = remember(monthly, rate, tenure) {
        FinancialCalculations.calculateRD(
            monthly.toDoubleOrNull() ?: 5000.0,
            rate.toDoubleOrNull() ?: 7.1,
            tenure.toIntOrNull() ?: 12
        )
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(onClick = onDismiss, colors = ButtonDefaults.buttonColors(containerColor = NestEmerald)) {
                Text("Close")
            }
        },
        title = { Text("Bank RD Calculator", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Indian quarterly compounding standard:", fontSize = 11.sp, color = TextDarkSecondary)
                OutlinedTextField(
                    value = monthly,
                    onValueChange = { monthly = it },
                    label = { Text("Monthly Deposit (₹)") }
                )
                OutlinedTextField(
                    value = rate,
                    onValueChange = { rate = it },
                    label = { Text("Annual Rate (%)") }
                )
                OutlinedTextField(
                    value = tenure,
                    onValueChange = { tenure = it },
                    label = { Text("Tenure (Months)") }
                )

                Card(colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Maturity: ${FinancialCalculations.formatINR(rdResult.maturityAmount)}", fontWeight = FontWeight.Bold, color = NestEmeraldLight)
                        Text("Invested: ${FinancialCalculations.formatINR(rdResult.totalInvested)}", fontSize = 12.sp)
                        Text("Interest Earned: ${FinancialCalculations.formatINR(rdResult.totalInterestEarned)}", fontSize = 12.sp, color = NestEmeraldLight)
                    }
                }
            }
        },
        containerColor = DarkSurface
    )
}

@Composable
fun SalaryDayBatchDialog(goals: List<Goal>, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(onClick = onDismiss, colors = ButtonDefaults.buttonColors(containerColor = NestEmerald)) {
                Text("Confirm Allocation")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
        title = { Text("Salary Day Batch Deposit", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Allocate planned monthly savings across active goals:", fontSize = 12.sp, color = TextDarkSecondary)
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
