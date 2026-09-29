"""Management command to seed development data."""
import random
import string
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from accounts.models import User, Role
from athletes.models import Athlete
from officers.models import DopingControlOfficer
from laboratories.models import Laboratory, LaboratoryStaff
from doping_tests.models import DopingTest, TestType, TestStatus
from samples.models import Sample, SampleType, SampleStatus
from notifications.models import Notification, NotificationType


class Command(BaseCommand):
    help = 'Seed the database with development test data. NEVER USE IN PRODUCTION.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--flush',
            action='store_true',
            help='Delete all existing seed data before seeding',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING(
            '[!] DEVELOPMENT ONLY -- Seeding test data...'
        ))

        if options['flush']:
            self.stdout.write('Flushing existing data...')
            User.objects.filter(email__endswith='@demo.sadms').delete()

        with transaction.atomic():
            # -------------------------------------------------------
            # Create users
            # -------------------------------------------------------
            admin_user, _ = User.objects.get_or_create(
                email='admin@demo.sadms',
                defaults={
                    'username': 'admin_demo',
                    'first_name': 'System',
                    'last_name': 'Administrator',
                    'phone': '+1-555-0001',
                    'role': Role.ADMINISTRATOR,
                    'is_staff': True,
                },
            )
            admin_user.set_password('Demo@1234')
            admin_user.save()
            self.stdout.write('  [+] Admin: admin@demo.sadms / Demo@1234')

            athlete_user, _ = User.objects.get_or_create(
                email='athlete@demo.sadms',
                defaults={
                    'username': 'athlete_demo',
                    'first_name': 'Aarav',
                    'last_name': 'Mehta',
                    'phone': '+1-555-0002',
                    'role': Role.ATHLETE,
                },
            )
            athlete_user.set_password('Demo@1234')
            athlete_user.save()
            self.stdout.write('  [+] Athlete: athlete@demo.sadms / Demo@1234')

            officer_user, _ = User.objects.get_or_create(
                email='officer@demo.sadms',
                defaults={
                    'username': 'officer_demo',
                    'first_name': 'Jon',
                    'last_name': 'Bell',
                    'phone': '+1-555-0003',
                    'role': Role.DOPING_CONTROL_OFFICER,
                },
            )
            officer_user.set_password('Demo@1234')
            officer_user.save()
            self.stdout.write('  [+] Officer: officer@demo.sadms / Demo@1234')

            lab_user, _ = User.objects.get_or_create(
                email='lab@demo.sadms',
                defaults={
                    'username': 'lab_demo',
                    'first_name': 'Elena',
                    'last_name': 'Rossi',
                    'phone': '+1-555-0004',
                    'role': Role.LABORATORY_STAFF,
                },
            )
            lab_user.set_password('Demo@1234')
            lab_user.save()
            self.stdout.write('  [+] Lab Staff: lab@demo.sadms / Demo@1234')

            authority_user, _ = User.objects.get_or_create(
                email='authority@demo.sadms',
                defaults={
                    'username': 'authority_demo',
                    'first_name': 'Nia',
                    'last_name': 'Okafor',
                    'phone': '+1-555-0005',
                    'role': Role.SPORTS_AUTHORITY,
                },
            )
            authority_user.set_password('Demo@1234')
            authority_user.save()
            self.stdout.write('  [+] Authority: authority@demo.sadms / Demo@1234')

            # -------------------------------------------------------
            # Create athlete profile
            # -------------------------------------------------------
            athlete, _ = Athlete.objects.get_or_create(
                user=athlete_user,
                defaults={
                    'athlete_id': 'ATH-2026-001',
                    'sport': 'Track & Field',
                    'nationality': 'India',
                    'team': 'Team India Athletics',
                    'coach': 'Rajesh Kumar',
                    'gender': 'Male',
                    'status': 'ACTIVE',
                },
            )
            self.stdout.write(f'  [+] Athlete profile: {athlete.athlete_id}')

            # -------------------------------------------------------
            # Create officer profile
            # -------------------------------------------------------
            officer, _ = DopingControlOfficer.objects.get_or_create(
                user=officer_user,
                defaults={
                    'officer_id': 'DCO-2026-001',
                    'certification_number': 'WADA-DCO-12345',
                    'organization': 'National Anti-Doping Agency',
                    'phone': '+1-555-0003',
                    'status': 'ACTIVE',
                },
            )
            self.stdout.write(f'  [+] Officer profile: {officer.officer_id}')

            # -------------------------------------------------------
            # Create laboratory and lab staff
            # -------------------------------------------------------
            lab, _ = Laboratory.objects.get_or_create(
                accreditation_number='WADA-LAB-001',
                defaults={
                    'laboratory_name': 'National Sports Science Laboratory',
                    'address': '123 Science Park, Research District',
                    'city': 'Mumbai',
                    'country': 'India',
                    'phone': '+91-22-12345678',
                    'email': 'lab@nssl.in',
                    'status': 'ACTIVE',
                },
            )
            self.stdout.write(f'  [+] Laboratory: {lab.laboratory_name}')

            lab_staff, _ = LaboratoryStaff.objects.get_or_create(
                user=lab_user,
                defaults={
                    'laboratory': lab,
                    'staff_id': 'STAFF-001',
                    'designation': 'Senior Analyst',
                    'qualification': 'PhD Analytical Chemistry',
                    'status': 'ACTIVE',
                },
            )
            self.stdout.write(f'  [+] Lab staff: {lab_staff.staff_id}')

            # -------------------------------------------------------
            # Create a sample doping test
            # -------------------------------------------------------
            test, created = DopingTest.objects.get_or_create(
                test_number='DST-2026-DEMO',
                defaults={
                    'athlete': athlete,
                    'officer': officer,
                    'scheduled_date': timezone.now().date(),
                    'test_type': TestType.IN_COMPETITION,
                    'location': 'National Athletics Stadium',
                    'reason': 'Routine in-competition test',
                    'status': TestStatus.SCHEDULED,
                },
            )
            if created:
                self.stdout.write(f'  [+] Doping test: {test.test_number}')
            else:
                self.stdout.write(f'  [~] Doping test already exists: {test.test_number}')

            # Create notifications for demo users
            Notification.objects.get_or_create(
                user=athlete_user,
                title='Welcome to Sports Anti-Doping Monitor',
                defaults={
                    'message': 'Your account has been set up. A test has been scheduled for you.',
                    'notification_type': NotificationType.TEST_SCHEDULED,
                    'related_object_type': 'test',
                    'related_object_id': str(test.id),
                    'is_read': False,
                },
            )

        self.stdout.write(self.style.SUCCESS(
            '\n[SUCCESS] Seed complete!\n'
            '   All demo accounts use password: Demo@1234\n'
            '   [!] DELETE THESE ACCOUNTS BEFORE GOING TO PRODUCTION'
        ))
