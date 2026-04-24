namespace Application.Services;

using Application.DTOs;
using Domain;
using Domain.Enums;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

public class RentObjectService : IRentObjectService
{

    private readonly IRentObjectRepository _rentobjRepository;
    private readonly IRentObjectRoomRepository _rentobjRoomRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITagRepository _tagRepository;
    private readonly IRentObjectTaggedRepository _rentobjTaggedRepository;
    private readonly IEmailService _emailService;

    public RentObjectService(IRentObjectRepository rentobjRepository, ITagRepository tagRepository, IRentObjectTaggedRepository rentobjTaggedRepository, IUserRepository userRepository, IRentObjectRoomRepository rentObjectRoomRepository, IEmailService emailService)
    {
        _rentobjRepository = rentobjRepository;
        _userRepository = userRepository;
        _tagRepository = tagRepository;
        _rentobjTaggedRepository = rentobjTaggedRepository;
        _rentobjRoomRepository = rentObjectRoomRepository;
        _emailService = emailService;
    }

    public async Task<List<RentObjectDto>> GetRentObjLimit(int Limit)
    {
        var RentObjects = _rentobjRepository.Query();
        List<Rent_Object> ListRentObj;
        if (Limit <= 0)
        {
            ListRentObj = await RentObjects
                .ToListAsync();
        }
        else
        {
            ListRentObj = await RentObjects
                .Take(Limit)
                .ToListAsync();
        }
        List<RentObjectDto> rentObjectDtos = new List<RentObjectDto>();
        foreach (Rent_Object obj in ListRentObj)
        {

            var tagJoins = await _rentobjTaggedRepository.Query()
            .Where(ot => ot.Rent_Object_ID == obj.Rent_Object_ID)
            .Join(_tagRepository.Query(), ot => ot.Tag_ID, t => t.Tag_ID, (ot, t) => new { ot.Rent_Object_ID, t.Tag_ID, t.Name })
            .ToListAsync();

            var RoomJoins = await _rentobjRoomRepository.GetByMainIdAsync(obj.Rent_Object_ID);

            var rooms = new List<MinorRentObjectRoomDto>();
            foreach (var room in RoomJoins){
                rooms.Add(new MinorRentObjectRoomDto
                {
                    Rent_Object_Room_ID = room.Rent_Object_Room_ID,
                    Adres_Budynek = room.Adres_Budynek,
                    Adres_KodPocztowy = room.Adres_KodPocztowy,
                    Adres_Pokoj = room.Adres_Pokoj,
                    Adres_Ulica_1 = room.Adres_Ulica_1,
                    Adres_Ulica_2 = room.Adres_Ulica_2,
                    Name_Object_Room = room.Name
                });
            }

            rentObjectDtos.Add(new RentObjectDto
            {

                Object_ID = obj.Rent_Object_ID,
                Adres_Miasto = obj.Adres_Miasto,
                Created_At = obj.Created_At,
                Description = obj.Description,
                Name = obj.Name,
                Owner_ID = obj.Owner_ID,
                Phone_Number = obj.Phone_Number,
                Rate = obj.Rating,
                Status = obj.Status,
                TagList = tagJoins.Select(tj => new TagDto { Tag_ID = tj.Tag_ID, Name = tj.Name }).ToList(),
                Category = obj.Category,
                Default_Time = obj.Default_Time,
                FrontEnd_Color = obj.FrontEnd_Color,
                Icon = obj.Icon,
                Pay_for_Hour = obj.Pay_for_Hour,
                RoomList = rooms
                
            });    
        }
        return rentObjectDtos;

    }

    public async Task<RentObjectDto> GetRentObjByIdAsync(string RentObjID)
    {
        var rentObj = await _rentobjRepository.GetByIdAsync(RentObjID);
        if (rentObj == null) return null;

        var tagJoins = await _rentobjTaggedRepository.Query()
            .Where(ot => ot.Rent_Object_ID == rentObj.Rent_Object_ID)
            .Join(_tagRepository.Query(), ot => ot.Tag_ID, t => t.Tag_ID, (ot, t) => new { ot.Rent_Object_ID, t.Tag_ID, t.Name })
            .ToListAsync();

        var RoomJoins = await _rentobjRoomRepository.GetByMainIdAsync(rentObj.Rent_Object_ID);

        var rooms = new List<MinorRentObjectRoomDto>();
        foreach (var room in RoomJoins)
        {
            rooms.Add(new MinorRentObjectRoomDto
            {
                Rent_Object_Room_ID = room.Rent_Object_Room_ID,
                Adres_Budynek = room.Adres_Budynek,
                Adres_KodPocztowy = room.Adres_KodPocztowy,
                Adres_Pokoj = room.Adres_Pokoj,
                Adres_Ulica_1 = room.Adres_Ulica_1,
                Adres_Ulica_2 = room.Adres_Ulica_2,
                Name_Object_Room = room.Name
            });
        }

        return new RentObjectDto
        {
            Object_ID = rentObj.Rent_Object_ID,
            Adres_Miasto = rentObj.Adres_Miasto,
            Created_At = rentObj.Created_At,
            Description = rentObj.Description,
            Name = rentObj.Name,
            Owner_ID = rentObj.Owner_ID,
            Phone_Number = rentObj.Phone_Number,
            Rate = rentObj.Rating,
            Status = rentObj.Status,
            TagList = tagJoins.Select(tj => new TagDto { Tag_ID = tj.Tag_ID, Name = tj.Name }).ToList(),
            Category = rentObj.Category,
            Default_Time = rentObj.Default_Time,
            FrontEnd_Color = rentObj.FrontEnd_Color,
            Icon = rentObj.Icon,
            Pay_for_Hour = rentObj.Pay_for_Hour,
            RoomList = rooms
            


        };
    }
    public async Task<RentObjectRoomDto> GetRentObjRoomByIdAsync(string RentObjRoomID)
    {
        var rentObjroom = await _rentobjRoomRepository.GetByIdAsync(RentObjRoomID);
        if (rentObjroom == null) return null;

        var rentObj = await _rentobjRepository.GetByIdAsync(rentObjroom.Rent_Object_Main_ID);

        var tagJoins = await _rentobjTaggedRepository.Query()
            .Where(ot => ot.Rent_Object_ID == rentObj.Rent_Object_ID)
            .Join(_tagRepository.Query(), ot => ot.Tag_ID, t => t.Tag_ID, (ot, t) => new { ot.Rent_Object_ID, t.Tag_ID, t.Name })
            .ToListAsync();

        return new RentObjectRoomDto
        {
            Rent_Object_ID = rentObj.Rent_Object_ID,
            Adres_Miasto = rentObj.Adres_Miasto,
            Created_At = rentObj.Created_At,
            Description = rentObj.Description,
            Name_Object = rentObj.Name,
            Owner_ID = rentObj.Owner_ID,
            Phone_Number = rentObj.Phone_Number,
            Rate = rentObj.Rating,
            Status = rentObj.Status,
            TagList = tagJoins.Select(tj => new TagDto { Tag_ID = tj.Tag_ID, Name = tj.Name }).ToList(),
            Category = rentObj.Category,
            Default_Time = rentObj.Default_Time,
            FrontEnd_Color = rentObj.FrontEnd_Color,
            Icon = rentObj.Icon,
            Pay_for_Hour = rentObj.Pay_for_Hour,

            Rent_Object_Room_ID = rentObjroom.Rent_Object_Room_ID,
            Adres_Budynek = rentObjroom.Adres_Budynek,
            Adres_KodPocztowy = rentObjroom.Adres_KodPocztowy,
            Adres_Pokoj = rentObjroom.Adres_Pokoj,
            Adres_Ulica_1 = rentObjroom.Adres_Ulica_1,
            Adres_Ulica_2 = rentObjroom.Adres_Ulica_2,
            Name_Object_Room = rentObjroom.Name

        };
    }
    public async Task<List<RentObjectDto>> SearchObjectsAsync(SearchRentObjectRequest request)
    {                                           
        var query = _rentobjRoomRepository.QueryWithMainOrder();

        if (!string.IsNullOrWhiteSpace(request.Id))
            query = query.Where(or => or.Main_Rent_Object.Rent_Object_ID == request.Id);

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            var name = request.Name.Trim().ToLower();
            query = query.Where(or => or.Main_Rent_Object.Name != null && or.Main_Rent_Object.Name.ToLower().Contains(name));
        }

        if (!string.IsNullOrWhiteSpace(request.Adres_Miasto))
        {
            var v = request.Adres_Miasto.Trim().ToLower();
            query = query.Where(or => or.Main_Rent_Object.Adres_Miasto != null && or.Main_Rent_Object.Adres_Miasto.ToLower().Contains(v));
        }

        if (!string.IsNullOrWhiteSpace(request.Adres_Ulica_1))
        {
            var v = request.Adres_Ulica_1.Trim().ToLower();
            query = query.Where(or => or.Adres_Ulica_1 != null && or.Adres_Ulica_1.ToLower().Contains(v));
        }

        if (!string.IsNullOrWhiteSpace(request.Adres_Budynek))
        {
            var v = request.Adres_Budynek.Trim().ToLower();
            query = query.Where(or => or.Adres_Budynek != null && or.Adres_Budynek.ToLower().Contains(v));
        }

        
        if (!string.IsNullOrWhiteSpace(request.Adres_Pokoj))
        {
            var v = request.Adres_Pokoj.Trim().ToLower();
            query = query.Where(or => or.Adres_Pokoj != null && or.Adres_Pokoj.ToLower().Contains(v));
        }
        

        if (!string.IsNullOrWhiteSpace(request.Adres_KodPocztowy))
        {
            var v = request.Adres_KodPocztowy.Trim().ToLower();
            query = query.Where(or => or.Adres_KodPocztowy != null && or.Adres_KodPocztowy.ToLower().Contains(v));
        }

        if (!string.IsNullOrWhiteSpace(request.Phone_Number))
        {
            var v = request.Phone_Number.Trim().ToLower();
            query = query.Where(or => or.Main_Rent_Object.Phone_Number != null && or.Main_Rent_Object.Phone_Number.ToLower().Contains(v));
        }

        if (!string.IsNullOrWhiteSpace(request.Owner_ID))
            query = query.Where(or => or.Main_Rent_Object.Owner_ID == request.Owner_ID);

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<RentObjectStatus>(request.Status, true, out var statusEnum))
            {
                query = query.Where(or => or.Main_Rent_Object.Status == statusEnum);
            }
        }

        if (request.MinRate.HasValue)
            query = query.Where(or => or.Main_Rent_Object.Rating >= request.MinRate.Value);

        if (request.MaxRate.HasValue)
            query = query.Where(or => or.Main_Rent_Object.Rating <= request.MaxRate.Value);

        if (request.TagList != null && request.TagList.Any())
        {
            var tagNames = request.TagList.Where(t => !string.IsNullOrWhiteSpace(t)).Select(t => t.Trim()).ToList();
            if (tagNames.Count > 0)
            {
                var matchingTagIds = _tagRepository.Query()
                    .Where(t => tagNames.Contains(t.Name))
                    .Select(t => t.Tag_ID);

                var objectIds = _rentobjTaggedRepository.Query()
                    .Where(ot => matchingTagIds.Contains(ot.Tag_ID))
                    .GroupBy(ot => ot.Rent_Object_ID)
                    .Where(g => g.Select(ot => ot.Tag_ID).Distinct().Count() == tagNames.Count)
                    .Select(g => g.Key);

                query = query.Where(or => objectIds.Contains(or.Main_Rent_Object.Rent_Object_ID));
            }
        }

        if (request.Limit.HasValue)
            query = query.Take(request.Limit.Value);

        var objs = await query.ToListAsync();

        var ids = objs.Select(or => or.Main_Rent_Object.Rent_Object_ID).ToList();

        var tagJoins = await _rentobjTaggedRepository.Query()
            .Where(ot => ids.Contains(ot.Rent_Object_ID))
            .Join(_tagRepository.Query(), ot => ot.Tag_ID, t => t.Tag_ID, (ot, t) => new { ot.Rent_Object_ID, t.Tag_ID, t.Name })
            .ToListAsync();

        var results = objs.Select(or => new RentObjectDto
        {
            Object_ID = or.Main_Rent_Object.Rent_Object_ID,
            Name = or.Main_Rent_Object.Name,
            Description = or.Main_Rent_Object.Description,
            Rate = or.Main_Rent_Object.Rating,
            Adres_Miasto = or.Main_Rent_Object.Adres_Miasto,
            Adres_Ulica_1 = or.Adres_Ulica_1,
            Adres_Ulica_2 = or.Adres_Ulica_2,
            Adres_Budynek = or.Adres_Budynek,
            Adres_Pokoj = or.Adres_Pokoj,
            Adres_KodPocztowy = or.Adres_KodPocztowy,
            Phone_Number = or.Main_Rent_Object.Phone_Number,
            Created_At = or.Main_Rent_Object.Created_At,
            Owner_ID = or.Main_Rent_Object.Owner_ID,
            Status = or.Main_Rent_Object.Status,
            TagList = tagJoins.Where(tj => tj.Rent_Object_ID == or.Main_Rent_Object.Rent_Object_ID).Select(tj => new TagDto { Tag_ID = tj.Tag_ID, Name = tj.Name }).ToList()
        }).ToList();

        return results;
    }

    public async Task<GeneralResponse> CreateAsync(CreateRentObjectRequest request)
    {

        if (string.IsNullOrWhiteSpace(request.Name))
            return new GeneralResponse { Success = false, Message = "Name is required" };

        if (string.IsNullOrWhiteSpace(request.Category))
            return new GeneralResponse { Success = false, Message = "Category is required" };

        if (string.IsNullOrWhiteSpace(request.Description))
            return new GeneralResponse { Success = false, Message = "Description is required" };

        if (string.IsNullOrWhiteSpace(request.Icon))
            return new GeneralResponse { Success = false, Message = "Icon is required" };

        if (request.Default_Time <= 0)
            return new GeneralResponse { Success = false, Message = "Default Time is required non-zero and positive" };

        if (request.Pay_for_Hour < 0)
            return new GeneralResponse { Success = false, Message = "Pay_for_Hour is required non-negative" };

        if (string.IsNullOrWhiteSpace(request.Adres_Miasto))
            return new GeneralResponse { Success = false, Message = "City is required" };

        if (char.IsWhiteSpace(request.FrontEnd_Color))
            return new GeneralResponse { Success = false, Message = "FrontEnd_Color is required" };

        if (string.IsNullOrWhiteSpace(request.Phone_Number))
            return new GeneralResponse { Success = false, Message = "Phone_Number is required" };

        if (request.TagList.Count() == 0)
            return new GeneralResponse { Success = false, Message = "Tag list is required" };
        foreach (var tag in request.TagList)
        {
            if (string.IsNullOrWhiteSpace(tag))
                return new GeneralResponse { Success = false, Message = "tag is required not-null or not-whitespace" };
        }
        if (request.RoomsList.Count() == 0)
            return new GeneralResponse { Success = false, Message = "Room list is required" };
        foreach (var room in request.RoomsList)
        {
            if (string.IsNullOrWhiteSpace(room.Name))
                return new GeneralResponse { Success = false, Message = "Room name is required" };
            if (string.IsNullOrWhiteSpace(room.Adres_Ulica_1))
                return new GeneralResponse { Success = false, Message = "Room Adres_Ulica_1 is required" };
            if (string.IsNullOrWhiteSpace(room.Adres_Ulica_2))
                return new GeneralResponse { Success = false, Message = "Room Adres_Ulica_2 is required" };
            if (string.IsNullOrWhiteSpace(room.Adres_Budynek))
                return new GeneralResponse { Success = false, Message = "Room Adres_Budynek is required" };
            if (string.IsNullOrWhiteSpace(room.Adres_Pokoj))
                return new GeneralResponse { Success = false, Message = "Room Adres_Pokoj is required" };
            if (string.IsNullOrWhiteSpace(room.Adres_KodPocztowy))
                return new GeneralResponse { Success = false, Message = "Room Adres_KodPocztowy is required" };
        }


        if (await _rentobjRepository.CheckIfNameExistsAsync(request.Name))
            return new GeneralResponse { Success = false, Message = "Object with this name already exists" };


        var Owner = await _userRepository.GetByIdAsync(request.Owner_ID);
        if (Owner == null)
            return new GeneralResponse { Success = false, Message = "Owner is required" };
        //token -> need to take id from token


        var newObject = new Domain.Rent_Object
        {
            Name = request.Name,
            Category = request.Category,
            Description = request.Description,
            Icon = request.Icon,
            Default_Time = request.Default_Time,
            Pay_for_Hour = request.Pay_for_Hour,
            Rating = 0,
            Adres_Miasto = request.Adres_Miasto,
            FrontEnd_Color = request.FrontEnd_Color,
            Phone_Number = request.Phone_Number,
            Created_At = DateTime.UtcNow,
            Owner_ID = Owner.User_ID,
            Owner = Owner,
            Status = RentObjectStatus.Active
        };


        await _rentobjRepository.AddAsync(newObject);
        await _rentobjRepository.SaveChangesAsync();


        var TagList = new List<Tag>();
        bool flag = false;
        foreach (var tagName in request.TagList)
        {
            var tag = await _tagRepository.GetByNameAsync(tagName);
            if (tag == null)
            {
                flag = true;
                Tag _tag = new Tag();
                _tag.Name = tagName;
                await _tagRepository.AddAsync(_tag);
                TagList.Add(_tag);
            }
            else
                TagList.Add(tag);
        }
        if (flag)
        {
            await _tagRepository.SaveChangesAsync();
        }

        foreach (var tag in TagList)
        {
            Rent_Object_Tagged object_Tagged = new Rent_Object_Tagged();
            object_Tagged.Rent_Object_ID = newObject.Rent_Object_ID;
            object_Tagged.Tag_ID = tag.Tag_ID;
            await _rentobjTaggedRepository.AddAsync(object_Tagged);
        }
        await _rentobjTaggedRepository.SaveChangesAsync();

        foreach (var room in request.RoomsList)
        {
            Rent_Object_Room room_object = new Rent_Object_Room
            {
                Name = room.Name,
                Adres_Ulica_1 = room.Adres_Ulica_1,
                Adres_Ulica_2 = room.Adres_Ulica_2,
                Adres_Budynek = room.Adres_Budynek,
                Adres_Pokoj = room.Adres_Pokoj,
                Adres_KodPocztowy = room.Adres_KodPocztowy,
                Rent_Object_Main_ID = newObject.Rent_Object_ID,
                Main_Rent_Object = newObject
            };
            await _rentobjRoomRepository.AddAsync(room_object);
        }
        await _rentobjRoomRepository.SaveChangesAsync();
        await _emailService.SendObjectCreatedAsync(Owner.Email, newObject.Name).ContinueWith(task =>
        {
            if (task.IsFaulted)
                Console.WriteLine($"Failed to send object creation email: {task.Exception?.GetBaseException().Message}");
            else
                Console.WriteLine("Object creation email sent successfully");
        });

        return new GeneralResponse { Success = true, Message = "Object created successfully" };
    }

    public async Task<GeneralResponse> EditAsync(EditRentObjectRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Rent_Object_ID))
            return new GeneralResponse { Success = false, Message = "Object Id is required" };


        var RentObject = await _rentobjRepository.GetByIdAsync(request.Rent_Object_ID);

        if (RentObject == null)
            return new GeneralResponse { Success = false, Message = "Object is not found" };


        RentObject.Name = request.Name == string.Empty ? RentObject.Name : request.Name;
        RentObject.Category = request.Category == string.Empty ? RentObject.Category : request.Category;
        RentObject.Description = request.Description == string.Empty ? RentObject.Description : request.Description;
        RentObject.Icon = request.Icon == string.Empty ? RentObject.Icon : request.Icon;
        RentObject.Default_Time = request.Default_Time <= -1 ? RentObject.Default_Time : request.Default_Time;
        RentObject.Pay_for_Hour = request.Pay_for_Hour < 0 ? RentObject.Pay_for_Hour : request.Pay_for_Hour;
        RentObject.Adres_Miasto = request.Adres_Miasto == string.Empty ? RentObject.Adres_Miasto : request.Adres_Miasto;
        RentObject.FrontEnd_Color = request.FrontEnd_Color == ' ' ? RentObject.FrontEnd_Color : request.FrontEnd_Color;
        RentObject.Phone_Number = request.Phone_Number == string.Empty ? RentObject.Phone_Number : request.Phone_Number;
        RentObject.Status = request.Status == -1 ? RentObject.Status : (RentObjectStatus)request.Status;

        await _rentobjRepository.SaveChangesAsync();
        var owner = await _userRepository.GetByIdAsync(RentObject.Owner_ID);
        await _emailService.SendObjectEditedAsync(owner.Email, RentObject.Name);

        return new GeneralResponse { Success = true, Message = "Object edited successfully" };
    }

    public async Task<GeneralResponse> AddRoomAsync(AddRentObjectRoom request)
    {

        if (string.IsNullOrWhiteSpace(request.Name))
            return new GeneralResponse { Success = false, Message = "Room name is required" };

        if (string.IsNullOrWhiteSpace(request.Adres_Pokoj))
            return new GeneralResponse { Success = false, Message = "Room Adres_Pokoj is required" };

        if (string.IsNullOrWhiteSpace(request.Adres_Budynek))
            return new GeneralResponse { Success = false, Message = "Room Adres_Budynek is required" };

        if (string.IsNullOrWhiteSpace(request.Adres_KodPocztowy))
            return new GeneralResponse { Success = false, Message = "Room Adres_KodPocztowy is required" };

        if (string.IsNullOrWhiteSpace(request.Adres_Ulica_1))
            return new GeneralResponse { Success = false, Message = "Room Adres_Ulica_1 is required" };

        if (string.IsNullOrWhiteSpace(request.Adres_Ulica_2))
            return new GeneralResponse { Success = false, Message = "Room Adres_Ulica_2 is required" };


        if (string.IsNullOrWhiteSpace(request.Rent_Obj_Id))
            return new GeneralResponse { Success = false, Message = "Room Rent_Obj_Id is required" };

        var RentObj = await _rentobjRepository.GetByIdAsync(request.Rent_Obj_Id);
        if (RentObj == null)
            return new GeneralResponse { Success = false, Message = "Rent_Obj is not found" };


        Rent_Object_Room room_object = new Rent_Object_Room
        {
            Name = request.Name,
            Adres_Ulica_1 = request.Adres_Ulica_1,
            Adres_Ulica_2 = request.Adres_Ulica_2,
            Adres_Budynek = request.Adres_Budynek,
            Adres_Pokoj = request.Adres_Pokoj,
            Adres_KodPocztowy = request.Adres_KodPocztowy,
            Rent_Object_Main_ID = RentObj.Rent_Object_ID,
            Main_Rent_Object = RentObj
        };
        await _rentobjRoomRepository.AddAsync(room_object);

        await _rentobjRoomRepository.SaveChangesAsync();
        var owner = await _userRepository.GetByIdAsync(RentObj.Owner_ID);
        await _emailService.SendObjectEditedAsync(owner.Email, RentObj.Name);

        return new GeneralResponse { Success = true, Message = "Room added successfully" };
    }
    public async Task<GeneralResponse> EditRoomAsync(EditRentObjectRoom request)
    {

        if (string.IsNullOrWhiteSpace(request.Rent_Obj_Id))
            return new GeneralResponse { Success = false, Message = "Room Rent_Obj_Id is required" };

        var RentObj = await _rentobjRepository.GetByIdAsync(request.Rent_Obj_Id);
        if (RentObj == null)
            return new GeneralResponse { Success = false, Message = "Rent_Obj is not found" };

        if (string.IsNullOrWhiteSpace(request.Rent_room_Obj_Id))
            return new GeneralResponse { Success = false, Message = "Room Obj_Id is required" };

        var RoomObj = await _rentobjRoomRepository.GetByIdAsync(request.Rent_room_Obj_Id);
        if (RoomObj == null)
            return new GeneralResponse { Success = false, Message = "Room_Obj is not found" };


        if(RoomObj.Rent_Object_Main_ID != RentObj.Rent_Object_ID)
            return new GeneralResponse { Success = false, Message = "Wrong room/rentObj" };


        RoomObj.Name = request.Name==string.Empty?RoomObj.Name:request.Name;
        RoomObj.Adres_Pokoj = request.Adres_Pokoj==string.Empty?RoomObj.Adres_Pokoj:request.Adres_Pokoj;
        RoomObj.Adres_Budynek = request.Adres_Budynek==string.Empty?RoomObj.Adres_Budynek:request.Adres_Budynek;
        RoomObj.Adres_KodPocztowy = request.Adres_KodPocztowy == string.Empty ? RoomObj.Adres_KodPocztowy : request.Adres_KodPocztowy;
        RoomObj.Adres_Ulica_1 = request.Adres_Ulica_1 == string.Empty ? RoomObj.Adres_Ulica_1 : request.Adres_Ulica_1;
        RoomObj.Adres_Ulica_2 = request.Adres_Ulica_2 == string.Empty ? RoomObj.Adres_Ulica_2 : request.Adres_Ulica_2;

        await _rentobjRoomRepository.SaveChangesAsync();
        var owner = await _userRepository.GetByIdAsync(RentObj.Owner_ID);
        await _emailService.SendObjectEditedAsync(owner.Email, RentObj.Name);

        return new GeneralResponse { Success = true, Message = "Room Edited successfully" };
    }
}
